#!/usr/bin/env bash
#
# select-issues.sh — fetch and order open GitHub issues for the resolve-issues plugin.
#
# Outputs a JSON array of issues ordered by priority (highest first), then newest
# first (descending issue number). Priority is derived from each issue's labels.
#
# Usage:
#   select-issues.sh [--issue N] [--label LABEL] [--max N] [--repo OWNER/NAME]
#   select-issues.sh --input FILE   # read raw issues JSON from FILE instead of gh (for tests)
#
# Output: JSON array. Each element is the gh issue object plus a computed
#         "priorityRank" (0=critical .. 3=low, 99=unprioritized).
#
# Recognized priority labels (case-insensitive):
#   critical: "priority: critical", "p0", "critical"
#   high:     "priority: high",     "p1", "high"
#   medium:   "priority: medium",   "p2", "medium"
#   low:      "priority: low",      "p3", "low"
#
set -euo pipefail

ISSUE=""
LABEL=""
MAX=""
REPO=""
INPUT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --issue) ISSUE="${2:?--issue needs a value}"; shift 2 ;;
    --label) LABEL="${2:?--label needs a value}"; shift 2 ;;
    --max)   MAX="${2:?--max needs a value}";     shift 2 ;;
    --repo)  REPO="${2:?--repo needs a value}";   shift 2 ;;
    --input) INPUT="${2:?--input needs a value}"; shift 2 ;;
    -h|--help)
      sed -n '3,30p' "$0"; exit 0 ;;
    *) echo "select-issues.sh: unknown argument: $1" >&2; exit 2 ;;
  esac
done

if [ -n "$MAX" ] && ! [[ "$MAX" =~ ^[0-9]+$ ]]; then
  echo "select-issues.sh: --max must be a non-negative integer, got: $MAX" >&2
  exit 2
fi

JSON_FIELDS="number,title,labels,updatedAt,url,state"

# --- acquire raw issues JSON -------------------------------------------------
if [ -n "$INPUT" ]; then
  raw="$(cat "$INPUT")"
elif [ -n "$ISSUE" ]; then
  view_args=(issue view "$ISSUE" --json "$JSON_FIELDS")
  [ -n "$REPO" ] && view_args+=(--repo "$REPO")
  raw="[$(gh "${view_args[@]}")]"
else
  list_args=(issue list --state open --json "$JSON_FIELDS" --limit 1000)
  [ -n "$REPO" ]  && list_args+=(--repo "$REPO")
  [ -n "$LABEL" ] && list_args+=(--label "$LABEL")
  raw="$(gh "${list_args[@]}")"
fi

# --- rank, sort, cap ---------------------------------------------------------
echo "$raw" | jq --argjson max "${MAX:-0}" '
  def rank(labels):
    (labels | map(.name | ascii_downcase)) as $l
    | if   ($l | any(IN("priority: critical","p0","critical"))) then 0
      elif ($l | any(IN("priority: high","p1","high")))         then 1
      elif ($l | any(IN("priority: medium","p2","medium")))     then 2
      elif ($l | any(IN("priority: low","p3","low")))           then 3
      else 99 end;
  map(. + {priorityRank: rank(.labels)})
  | sort_by(.priorityRank, (-.number))
  | if $max > 0 then .[:$max] else . end
'
