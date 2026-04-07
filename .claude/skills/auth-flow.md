# Skill: Auth Flow

Use this if auth or protected routes are involved.

## Principles
- be careful with token/session handling
- do not expose sensitive data in client-side logs
- preserve existing auth flow conventions
- verify server/client boundaries carefully

## Checklist
- auth state loading handled
- unauthenticated flow handled
- protected routes behave correctly
- token/session assumptions are validated
- redirect logic is explicit and safe
