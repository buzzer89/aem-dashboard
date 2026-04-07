# Frontend Rules

## Component design
- Keep components small and focused
- Prefer one clear responsibility per component
- Reuse existing components before creating new ones
- Avoid large deeply nested JSX when logic can be extracted
- Keep props explicit and understandable

## State handling
- Keep state as local as possible
- Avoid storing derived state unless necessary
- Prefer clear event handlers over inline complex logic
- Avoid unnecessary useEffect usage when simple derived values will do

## UX states
Every user-facing async flow should consider:
- loading
- success
- empty
- error

## Next.js usage
- Follow current repo conventions for App Router or Pages Router
- Use server/client boundaries deliberately
- Do not convert server/client component types without need
- Be cautious with browser-only APIs in server contexts

## Accessibility
- Use semantic HTML where possible
- Ensure buttons/inputs/labels are properly associated
- Do not rely only on color to convey meaning
- Add accessible labels when UI is icon-only

## Readability
- Prefer clarity over compactness
- Use descriptive variable/function names
- Extract repeated conditional logic if it improves readability

## Change discipline
- Do not restyle unrelated areas
- Do not rename broadly without reason
- Do not rewrite working components just for preference
