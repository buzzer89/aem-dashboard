# Skill: Component Patterns

Use this guidance when building or editing components.

## Preferred approach
1. identify whether component is presentational or stateful
2. keep responsibilities narrow
3. extract repeated UI only when reuse or clarity justifies it
4. keep props simple and explicit

## Good patterns
- small reusable input components
- simple layout wrappers
- clearly named action handlers
- extracted helper functions for display formatting

## Avoid
- bloated all-in-one components
- deeply nested conditional rendering without helpers
- many boolean props creating confusing APIs
- hidden side effects inside render logic
