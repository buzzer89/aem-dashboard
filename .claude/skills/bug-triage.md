# Skill: Bug Triage

Use this when debugging.

## Process
1. define the symptom clearly
2. identify the exact failing scenario
3. locate the smallest relevant code path
4. inspect boundary assumptions
5. identify root cause
6. fix minimally
7. verify likely regressions

## Typical root-cause categories
- stale state
- missing dependency
- wrong conditional rendering
- bad prop assumptions
- broken API contract
- async race condition
- null/undefined access
- route param mismatch
- environment/config issue

## Output format
- symptom
- root cause
- impacted area
- safest fix
- validation steps
