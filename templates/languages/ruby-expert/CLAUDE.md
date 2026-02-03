# Ruby Expert Development Guide

Principal-level guidelines for Ruby engineering. The best Ruby developer on your team: they've seen the outages, heard the war stories, and know what to expect and when.

---

## Overview

This guide applies to:
- Web applications (Rails, Hanami, Roda, Sinatra)
- Background job systems (Sidekiq, Solid Queue, Good Job)
- CLI tools and automation (Thor, OptionParser)
- Libraries and gems published to RubyGems
- APIs and service layers
- Scripts and glue code that run in production

### Core Philosophy

Ruby rewards clarity and convention. Principal-level Ruby means knowing when to follow the grain and when to push back — and why.

- **Optimize for humans first.** Ruby is designed for programmer happiness and long-term maintainability. Clever one-liners that obscure intent are a liability.
- **Convention over configuration.** Use the standard library and community idioms unless you have a measured reason not to.
- **Fail fast, fail loud.** Silent failures and swallowed exceptions are how 3 AM pages happen.
- **The GIL is real.** Design for it: processes, background jobs, and I/O concurrency — not threads for CPU-bound work.
- **Memory and N+1s bite.** Profile before optimizing; know when `includes`, `eager_load`, and query batching matter.
- **Metaprogramming is a sharp tool.** Use it to remove boilerplate and enforce contracts. Don't use it to show off.
- **If you don't know, say so.** Admitting uncertainty about a gem or MRI internals is professional.

### Project Structure

**Rails app:** `app/controllers`, `app/models`, `app/services`, `app/jobs`, `app/lib`, `config`, `spec` or `test`.

**Gem or script:** `lib/my_gem/`, `spec/`, `my_gem.gemspec`.

---

## Idioms and Style

- **RuboCop (or Standard Ruby)** in CI; fix or explicitly disable with a comment and ticket.
- **Frozen string literals:** `# frozen_string_literal: true` in new files.
- **Naming:** `snake_case` methods/variables, `CamelCase` classes/modules, predicates: `user.active?`, `valid?`.
- **Blocks:** `each { }` for single expression, `each do ... end` for multi-line. Prefer Enumerable over raw loops.
- **Keyword arguments** for optional or many parameters. Return early to reduce nesting.
- **Composition over inheritance.** Metaprogramming: use sparingly; never `eval` or `send` with user input.
- **Rails:** skinny controller, skinny model, fat service/policy objects.

---

## Error Handling

- **Exceptions are for exceptional conditions.** Use return values, `nil`, or Result objects for expected "not found" or validation failure.
- **Rescue specific classes.** Never bare `rescue` or `rescue Exception` without immediate re-raise or documented justification.
- **At boundaries:** rescue, log with context, then re-raise or report to error tracking. Don't swallow.
- **Custom errors:** namespace under app/gem; inherit from `StandardError`.

---

## Concurrency and Threading

- **MRI has a GIL.** Threads don't give CPU parallelism; use processes or job queues for CPU-bound work.
- **Background jobs:** Sidekiq/Solid Queue/Good Job. Design jobs to be idempotent; configure retries and timeouts.
- **Request state:** don't store request-scoped data in class variables or globals.

---

## Performance

- **Profile first.** N+1s: use `includes`/`eager_load`/`preload`; enable Bullet in development. Use `find_each`/`in_batches` for large sets.
- **Memory:** frozen string literals; stream or batch large collections.
- **Caching:** add only with clear invalidation and TTL.

---

## Testing

- **RSpec or Minitest:** pick one per project. Test behavior, not implementation. Factories over fixtures; no silent rescue in tests.
- **Mocks/stubs at boundaries only.** No flaky tests on main.

---

## Rails and Frameworks

- **Controllers:** params, auth, render. **Models:** persistence, scopes, validations. **Services:** orchestration. **Jobs:** idempotent, small payloads.
- **Production:** eager load, connection pools, structured logging, error tracking, health checks, graceful shutdown.
- **Upgrades:** stay on supported versions; address deprecations.

---

## Tooling

- **RuboCop/Standard Ruby** in CI. **Bundler:** lockfile committed; `bundle audit` in CI.
- **No `binding.pry` or `debug` in committed code.** Ruby version via `.ruby-version`.

---

## Definition of Done

- [ ] Tests pass; RuboCop passes; no bare `rescue` or `rescue Exception`.
- [ ] N+1s checked; no unsafe metaprogramming without review.
- [ ] Code reviewed and approved.

Consider these rules if they affect your changes.
