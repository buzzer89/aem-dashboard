# Project Context

## What this project is
This is a test web app used to practice:
- building features
- debugging issues
- writing tests
- reviewing code
- improving maintainability

It is intentionally small-to-medium in scope and should stay easy to understand.

## Typical app areas
Depending on project structure, code may live in:
- `src/app` or `app` for App Router pages/routes
- `src/pages` or `pages` for Pages Router
- `src/components` for reusable UI
- `src/lib` for utilities
- `src/services` for API/service logic
- `src/hooks` for custom hooks
- `src/types` for shared types
- `tests` or colocated `*.test.*` files for tests

## Typical work items
- add a page
- add a component
- connect a UI to an API
- fix a rendering bug
- fix a state management issue
- improve validation
- write tests
- refactor duplicated code
- explain app flow

## Development expectations
- keep code readable
- prefer straightforward solutions
- reuse existing patterns
- do not over-engineer
- avoid unnecessary dependencies
- changes should be easy to review

## Common quality expectations
- forms should validate properly
- loading/error states should be handled
- API calls should fail gracefully
- components should remain focused
- tests should cover important behavior

## Good default assumptions
If no existing pattern is found:
- prefer server/client separation appropriate for Next.js
- keep data fetching simple
- keep component props explicit
- centralize repeated API logic when practical
- avoid global state unless truly needed
