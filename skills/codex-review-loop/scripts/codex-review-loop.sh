#!/usr/bin/env bash
#
# codex-review-loop.sh — drive the GitHub Codex (@codex) review loop on a PR.
#
# The mechanical half of the codex review loop (see docs/adr/003-codex-review-loop.md):
# detect the connector, trigger a review, poll the three GitHub channels Codex uses, and
# classify the outcome as clean / findings / working. The judgement half (is a finding a
# real issue, how to fix it) stays with the calling agent.
#
# Actions:
#   detect   --repo OWNER/NAME
#       Print {"available": true|false|"unknown", "via": "<source>"} for the Codex
#       connector. Resolution order:
#         1. installed GitHub Apps that actually cover THIS repo (authoritative-positive).
#            Account-wide install lists are paginated (--paginate) and may include apps
#            scoped to *other* repos; a "selected" installation only counts after its
#            repository list confirms OWNER/NAME. Only an affirmative verdict is trusted
#            here — a non-match falls through (the visible page/scope may be incomplete).
#         2. prior connector activity in the repo (positive-only signal) => true.
#         3. otherwise "unknown" — availability can't be proven (e.g. fresh repo with a
#            non-App token), so the caller should trigger a review and decide empirically
#            (no response within the *normal* review window => treat as unavailable).
#       Never returns a false negative on a fresh repo: absence of evidence is "unknown".
#
#   detect-classify --input FILE   (or stdin)   [pure, no network]
#       Classify installed-apps JSON. Reads
#       {"installations":[{app_slug|slug, account:{login}?, repository_selection?,
#         repoIncluded?, suspended_at?}], "botSlug":"...", "owner":"OWNER"?}
#       and prints {"available":bool, "via":"app-list"}. An installation counts only if its
#       slug is the bot, it is not suspended, AND it covers this repo: "all" with
#       account.login == owner (when owner given), or "selected" with repoIncluded==true.
#
#   trigger  --repo OWNER/NAME --pr N
#       Post an "@codex review" comment on PR N. Prints the trigger time (ISO8601 UTC).
#
#   poll     --repo OWNER/NAME --pr N --since ISO8601
#       Fetch the three channels and classify bot activity newer than --since.
#       Prints the classification JSON (see "classify" for the shape).
#
#   classify --input FILE   (or stdin)
#       Pure classifier — no network. Reads a JSON object:
#         {
#           "since":          "<ISO8601>",                 # trigger time
#           "botLogin":       "chatgpt-codex-connector",   # optional, default as shown
#           "issueComments":  [ {user:{login}, created_at, body}, ... ],
#           "reviews":        [ {user:{login}, submitted_at, state, body}, ... ],
#           "inlineComments": [ {user:{login}, created_at, body, path, line, id}, ... ]
#         }
#       Prints:
#         {
#           "status":   "clean" | "findings" | "working",
#           "respondedAt": "<ISO8601 or null>",
#           "findings": [ {source, path, line, id, body}, ... ]
#         }
#       Codex's "[bot]" suffix on user.login is tolerated.
#
# Exit codes: 0 ok, 2 usage error.
#
set -euo pipefail

DEFAULT_BOT="chatgpt-codex-connector"
# Terminal "clean pass" signals — Codex posts a top-level issue comment on no findings.
CLEAN_REGEX="didn't find any major issues|did not find any major issues|no major issues|no issues|no actionable findings|looks good|no suggestions"
# The non-actionable "💡 Codex Review" wrapper review Codex posts around its findings.
BANNER_REGEX="here are some automated review suggestions|💡 codex review"

die() { echo "codex-review-loop.sh: $*" >&2; exit 2; }
need() { command -v "$1" >/dev/null 2>&1 || die "missing required tool: $1"; }

# ---- pure classifier (shared by `classify` and `poll`) ----------------------
# Reads the channels JSON on stdin, writes classification JSON to stdout.
classify_json() {
  jq --arg cleanre "$CLEAN_REGEX" --arg bannerre "$BANNER_REGEX" --arg defbot "$DEFAULT_BOT" '
    (.botLogin // $defbot)              as $bot
    | (.since // "")                    as $since
    # normalize a login like "chatgpt-codex-connector[bot]" -> base name
    | def base($l): ($l // "" | sub("\\[bot\\]$"; ""));
      def fromBot($u): (base($u.login) == $bot);
      def newer($ts): ($since == "" or (($ts // "") > $since));

      ([ .issueComments[]?  | select(fromBot(.user) and newer(.created_at)) ]) as $ic
    | ([ .reviews[]?        | select(fromBot(.user) and newer(.submitted_at))]) as $rv
    | ([ .inlineComments[]? | select(fromBot(.user) and newer(.created_at)) ]) as $il

    # clean if any bot issue-comment matches a terminal clean signal
    | ([ $ic[] | select((.body // "") | ascii_downcase | test($cleanre)) ]) as $clean

    # Inline comments are findings; review bodies are findings too, EXCEPT the
    # non-actionable "💡 Codex Review" wrapper banner, which carries no actionable content.
    | ([ $il[] | {source:"inline", path:(.path//null), line:(.line//null), id:(.id//null), body:(.body//"")} ]
        + [ $rv[] | select((.state//"") != "APPROVED" and (.body//"") != ""
                            and (((.body // "") | ascii_downcase | test($bannerre)) | not))
              | {source:"review", path:null, line:null, id:(.id//null), body:(.body//"")} ]) as $findings

    | ([ $ic[].created_at, $rv[].submitted_at, $il[].created_at ] | map(select(. != null)) | sort | last) as $respondedAt

    | if ($clean | length) > 0 then
        {status:"clean",    respondedAt:$respondedAt, findings:[]}
      elif ($findings | length) > 0 then
        {status:"findings", respondedAt:$respondedAt, findings:$findings}
      else
        {status:"working",  respondedAt:($respondedAt // null), findings:[]}
      end
  '
}

# ---- pure app-list classifier (shared by `detect` and `detect-classify`) ----
# Reads {installations:[...], botSlug, owner?} on stdin -> {available, via}.
# An installation counts only when ALL hold:
#   - slug == bot
#   - it is active (suspended_at is null/absent)
#   - it actually covers THIS repo:
#       repository_selection == "all"  AND  (no owner given OR account.login == owner), or
#       repository_selection == "selected" with repoIncluded == true (repo-scoped already).
# The account check stops an "all" install on a *different* account the caller can see from
# masquerading as coverage of this repo. The network layer computes repoIncluded.
detect_classify_json() {
  jq --arg defbot "$DEFAULT_BOT" '
    (.botSlug // $defbot)              as $slug
    | (.owner // "" | ascii_downcase)  as $owner
    | ([ .installations[]?
         | select((.app_slug // .slug // "") == $slug)
         | select((.suspended_at // null) == null)
         | (.repository_selection // "all") as $sel
         | (($sel == "all") and ($owner == "" or ((.account.login // "" | ascii_downcase) == $owner)))
           or (.repoIncluded == true) ]) as $covers
    | { available: ($covers | any), via: "app-list" }
  '
}

# ---- arg parsing ------------------------------------------------------------
[ $# -ge 1 ] || die "no action; expected detect|detect-classify|trigger|poll|classify"
case "$1" in -h|--help) sed -n '3,56p' "$0"; exit 0 ;; esac
ACTION="$1"; shift

REPO=""; PR=""; SINCE=""; INPUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --repo)  REPO="${2:?--repo needs a value}";  shift 2 ;;
    --pr)    PR="${2:?--pr needs a value}";       shift 2 ;;
    --since) SINCE="${2:?--since needs a value}"; shift 2 ;;
    --input) INPUT="${2:?--input needs a value}"; shift 2 ;;
    -h|--help) sed -n '3,56p' "$0"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

need jq

case "$ACTION" in
  classify)
    if [ -n "$INPUT" ]; then cat "$INPUT"; else cat; fi | classify_json
    ;;

  detect-classify)
    if [ -n "$INPUT" ]; then cat "$INPUT"; else cat; fi | detect_classify_json
    ;;

  detect)
    need gh
    [ -n "$REPO" ] || die "detect needs --repo"
    owner="${REPO%%/*}"

    # 1) authoritative: is the bot's GitHub App installed AND covering THIS repo?
    #    Account-wide lists (user/orgs) are paginated and may include installations
    #    scoped to *other* repos, so for each matching codex installation we resolve
    #    whether it actually covers $REPO before trusting an affirmative verdict.
    #    (The repo-scoped singular endpoint needs App-auth and 401s on a user token.)
    for ep in "user/installations" "orgs/$owner/installations"; do
      # --paginate streams every page; --jq '.installations[]' yields one install per line.
      insts="$(gh api --paginate "$ep" --jq '.installations[]?' 2>/dev/null | jq -s '.' 2>/dev/null)" || continue
      [ -n "$insts" ] && [ "$insts" != "[]" ] || continue

      # For each codex installation, mark repoIncluded: "all" => true; "selected" =>
      # check that installation's repository list (paginated) for $REPO.
      enriched="$(printf '%s' "$insts" | jq -c --arg bot "$DEFAULT_BOT" \
        '[ .[] | select((.app_slug // .slug // "") == $bot) ]')"
      [ "$enriched" = "[]" ] && continue

      resolved='[]'
      while IFS= read -r inst; do
        [ -n "$inst" ] || continue
        sel="$(printf '%s' "$inst" | jq -r '.repository_selection // "all"')"
        included=false
        if [ "$sel" != "all" ]; then
          id="$(printf '%s' "$inst" | jq -r '.id')"
          # Capture the full list first: piping gh straight into `grep -q` lets grep close
          # the pipe on first match, which (under `set -o pipefail`) surfaces gh's SIGPIPE
          # 141 as a pipeline failure and would drop a real match. -F/-x/-i: match the
          # owner/name literally and case-insensitively (repo names can contain "." etc.).
          repolist="$(gh api --paginate "user/installations/$id/repositories" \
                        --jq '.repositories[]?.full_name' 2>/dev/null || true)"
          if printf '%s\n' "$repolist" | grep -Fqix "$REPO"; then
            included=true
          fi
        fi
        resolved="$(printf '%s' "$resolved" | jq -c --argjson inst "$inst" --argjson inc "$included" \
          '. + [$inst + {repoIncluded:$inc}]')"
      done < <(printf '%s' "$enriched" | jq -c '.[]')

      # owner gate: an "all" install only covers this repo if its account is the repo owner;
      # suspended installs are dropped inside detect_classify_json.
      verdict="$(printf '%s' "$resolved" | jq -c --arg bot "$DEFAULT_BOT" --arg owner "$owner" \
        '{installations:., botSlug:$bot, owner:$owner}' | detect_classify_json 2>/dev/null)" || continue
      # Only trust an affirmative app-list verdict; a negative page might be incomplete
      # for a different account scope, so fall through rather than declaring false here.
      if [ "$(printf '%s' "$verdict" | jq -r '.available')" = "true" ]; then
        echo "$verdict"; exit 0
      fi
    done

    # 2) positive-only signal: has the connector ever commented in this repo?
    comments="$(gh api "repos/$REPO/issues/comments?per_page=100" 2>/dev/null || echo '[]')"
    hits="$(printf '%s' "$comments" | jq --arg bot "$DEFAULT_BOT" \
              '[ .[]? | select((.user.login // "" | sub("\\[bot\\]$"; "")) == $bot) ] | length' \
              2>/dev/null || echo 0)"
    if [ "${hits:-0}" -gt 0 ] 2>/dev/null; then
      echo '{"available":true,"via":"prior-activity"}'
    else
      # 3) can't prove it either way (e.g. fresh repo + user token) -> let the caller
      #    trigger and decide empirically. NOT a false negative.
      echo '{"available":"unknown","via":"undetermined"}'
    fi
    ;;

  trigger)
    need gh
    [ -n "$REPO" ] || die "trigger needs --repo"
    [ -n "$PR" ]   || die "trigger needs --pr"
    # Post the comment via the API and use the *server's* created_at as the trigger
    # boundary — avoids client/server clock skew that a local `now` would introduce.
    ts="$(gh api "repos/$REPO/issues/$PR/comments" -f body="@codex review" \
            --jq '.created_at' 2>/dev/null)" \
      || die "trigger: failed to post @codex review comment on $REPO#$PR"
    [ -n "$ts" ] || die "trigger: GitHub did not return a created_at timestamp"
    echo "$ts"
    ;;

  poll)
    need gh
    [ -n "$REPO" ]  || die "poll needs --repo"
    [ -n "$PR" ]    || die "poll needs --pr"
    # Require --since: without a boundary, classify would match *all* historical bot
    # activity and resurface findings from earlier rounds as if they were new.
    [ -n "$SINCE" ] || die "poll needs --since (the trigger timestamp from \`trigger\`)"

    # Paginate every channel; a PR with >100 comments/reviews would otherwise hide the
    # latest Codex activity past page 1. Fail loudly on API error rather than silently
    # treating it as "no activity" (which would hang the loop or fake a clean pass).
    fetch() {  # $1 = endpoint path
      local out
      out="$(gh api --paginate "$1" --jq '.[]' 2>/dev/null)" \
        || die "poll: GitHub API request failed: $1"
      printf '%s' "$out" | jq -s '.'
    }
    ic="$(fetch "repos/$REPO/issues/$PR/comments")"
    rv="$(fetch "repos/$REPO/pulls/$PR/reviews")"
    il="$(fetch "repos/$REPO/pulls/$PR/comments")"
    # Combine via stdin (jq -s), NOT --argjson: a busy PR's paginated channels can exceed
    # ARG_MAX and a command-line --argjson would fail with "Argument list too long".
    printf '%s\n%s\n%s\n' "$ic" "$rv" "$il" \
      | jq -s --arg since "$SINCE" \
          '{since:$since, issueComments:.[0], reviews:.[1], inlineComments:.[2]}' \
      | classify_json
    ;;

  *) die "unknown action: $ACTION (expected detect|detect-classify|trigger|poll|classify)" ;;
esac
