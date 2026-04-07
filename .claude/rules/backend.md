# Backend Rules

## API behavior
- Keep handlers focused
- Validate request inputs
- Return consistent status codes and response shapes
- Handle failures explicitly
- Avoid leaking internal details in error responses

## Data handling
- Never assume request data is valid
- Guard against missing fields, malformed values, and unexpected types
- Sanitize or validate user-controlled input where needed

## Maintainability
- Keep route logic readable
- Extract repeated logic into helpers when repeated enough
- Avoid mixing unrelated responsibilities in one handler

## Reliability
- Fail clearly and safely
- Log enough to debug locally, but avoid exposing secrets
- Prefer predictable responses over ambiguous ones
