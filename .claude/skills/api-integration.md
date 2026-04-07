# Skill: API Integration

Use this when connecting UI to APIs.

## Workflow
1. inspect existing service/fetch patterns
2. identify request and response shape
3. handle loading/error/success states
4. guard against missing or invalid data
5. keep the UI resilient

## Good defaults
- centralize repeated fetch logic
- parse data once
- map response data into view-friendly shape
- show user-friendly error states

## Common mistakes to avoid
- assuming response shape is always stable
- triggering duplicate requests accidentally
- ignoring loading and error states
- mixing rendering and low-level request details in one place
