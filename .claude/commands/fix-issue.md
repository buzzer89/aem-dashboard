# Command: Fix Issue

When asked to fix a bug, use this process.

## Process
1. restate the issue clearly
2. inspect the smallest relevant code path
3. identify likely root cause
4. explain the intended fix briefly
5. implement a minimal safe fix
6. add/update tests if appropriate
7. summarize root cause and solution

## Requirements
- do not patch symptoms only
- do not refactor unrelated code
- preserve current behavior outside the bug scope
- mention uncertainty if root cause is not fully proven

## Response format
- issue summary
- root cause
- fix
- validation
- risks/follow-up
