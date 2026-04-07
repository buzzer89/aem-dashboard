# Workflow

## General workflow
For most tasks:
1. read the request carefully
2. inspect the smallest relevant file set
3. identify current patterns
4. propose a concise plan
5. implement minimum necessary change
6. validate edge cases mentally or through tests
7. summarize clearly

## Feature workflow
1. understand the requirement
2. locate related routes/components/services
3. reuse patterns from similar features
4. implement incrementally
5. add/update tests
6. summarize behavior changes

## Bug fix workflow
1. restate the bug clearly
2. identify likely root cause
3. inspect boundary conditions
4. fix root cause with minimal edits
5. verify no obvious regressions
6. add/update tests when practical

## Code explanation workflow
1. describe purpose
2. explain main flow
3. highlight inputs/outputs
4. mention side effects and dependencies
5. explain in plain language

## Review workflow
1. understand scope of change
2. scan for correctness issues
3. scan for maintainability/readability issues
4. scan for missing test coverage
5. scan for security or data handling issues
6. classify issues by severity
