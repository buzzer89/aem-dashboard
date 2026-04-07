# Architecture Notes

## Preferred structure
Use a simple layered mental model:

1. UI layer
- pages
- layouts
- components

2. behavior layer
- hooks
- local state
- view-model style helpers when needed

3. data layer
- services
- fetch utilities
- adapters / mappers if useful

4. shared layer
- types
- constants
- utils

## Architectural preferences
- keep business logic out of large JSX blocks
- keep API logic out of presentational components where practical
- isolate transformation logic from rendering logic
- colocate small logic when it improves readability
- extract only when reuse or clarity justifies it

## Component philosophy
- presentational components should be easy to read
- container logic should be limited and explicit
- avoid passing too many props
- prefer composition over deep prop drilling when possible

## State philosophy
- keep state as local as possible
- derive state when possible instead of duplicating it
- avoid unnecessary global state
- be careful with duplicated source-of-truth values

## API philosophy
- centralize repeated fetch logic
- always handle unhappy paths
- validate assumptions about returned data
- normalize data shape when helpful for UI simplicity

## Refactoring threshold
Refactor only when:
- current code is actively blocking the task
- duplication is obvious and repeated
- readability is clearly poor
- bug risk is increased by current structure

Do not refactor broadly during unrelated bug fixes.
