# API Rules

## API calls
- Centralize repeated API logic where practical
- Reuse shared fetch wrappers if they exist
- Keep request logic consistent across the app
- Avoid hardcoding environment-specific URLs

## Error handling
- Always handle network failure
- Always handle non-2xx responses
- Provide meaningful fallback UI or messaging
- Avoid silent failures

## Data usage
- Validate required fields before use
- Do not assume nested objects always exist
- Map API data into UI-friendly shapes when needed

## Consistency
- Use current repo conventions for:
  - fetch wrappers
  - auth headers
  - error handling
  - response parsing
  - request typing

## Security basics
- Do not expose secrets in client code
- Be careful with tokens and auth data
- Avoid logging sensitive payloads
