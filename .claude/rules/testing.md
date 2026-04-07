# Testing Rules

## What to test
- behavior that changed
- critical user interactions
- validation logic
- success and failure states
- edge cases where risk is meaningful

## Test style
- Prefer behavior-focused tests
- Avoid testing private implementation details
- Keep each test focused on one idea
- Use descriptive test names

## Good coverage patterns
For a form:
- renders correctly
- accepts valid input
- rejects invalid input
- handles submit success
- handles submit failure

For a data-fetching UI:
- loading state
- success render
- empty state if relevant
- error state

## Maintainability
- Reuse existing test utilities
- Prefer simple mocks
- Keep arrange/act/assert flow clear
