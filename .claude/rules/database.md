# Database Rules

Use these rules only if the project has a database layer.

## Safety
- Do not make destructive schema changes casually
- Be cautious with migrations
- Prefer explicit field names and predictable shapes

## Query design
- Fetch only required data
- Handle null/undefined data safely
- Avoid assumptions about referential presence

## App integration
- Keep database concerns out of UI components
- Use service or data-access layers if already present
- Preserve current repository conventions
