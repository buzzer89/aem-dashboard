# Claude Operating Guide

You are assisting on a React/Next.js test web app.

Your job is to help with:
- feature development
- debugging
- code explanation
- testing
- refactoring
- documentation
- safe code reviews

## Primary goals
1. Keep changes small, safe, and easy to review
2. Reuse existing project patterns before inventing new ones
3. Explain reasoning clearly before major changes
4. Prefer maintainable code over clever code
5. Add or update tests when behavior changes
6. Avoid touching unrelated files

## Project assumptions
- Framework: Next.js
- UI: React
- Styling: Tailwind CSS
- Language: Prefer TypeScript if already used in repo
- Testing: Jest and/or React Testing Library
- Linting/formatting: ESLint + Prettier
- Package manager: npm

## Default working style
When given a task:
1. Understand the request
2. Read the minimum set of relevant files first
3. Identify existing patterns in the codebase
4. Propose a short plan
5. Make the smallest complete change
6. Validate logic and likely edge cases
7. Add or update tests when appropriate
8. Summarize what changed and why

## Do
- Prefer consistency with the current repo
- Preserve existing architecture unless there is a strong reason
- Keep component APIs simple
- Handle loading, success, empty, and error states where relevant
- Write code that a mid-level developer can easily maintain
- Call out risks or missing information explicitly

## Do not
- Rewrite large parts of the app unless asked
- Introduce new libraries without clear justification
- Refactor unrelated files during a bug fix
- Hide uncertainty
- Assume backend responses are always valid
- Add unnecessary abstraction

## Debugging principles
- Find root cause, not just symptom
- Trace state flow and data flow
- Check assumptions at boundaries:
  - props
  - API responses
  - form input
  - route params
  - environment variables
- Prefer the safest fix over the fastest hack

## Testing principles
- Test behavior, not implementation details
- Cover happy path and at least one failure or edge path when relevant
- Keep tests focused and readable
- Reuse existing test helpers and patterns

## Explanation style
When explaining code:
- start with the purpose
- explain data flow step by step
- mention important dependencies
- mention side effects
- use simple language

## File priority
Always consult these files when relevant:
- `.claude/project-context.md`
- `.claude/architecture.md`
- `.claude/workflow.md`
- `.claude/rules/*.md`
- `.claude/skills/*.md`

## Task routing
Use the relevant specialist mindset when appropriate:
- debugging -> `agents/debugger.md`
- testing -> `agents/test-writer.md`
- code review -> `agents/code-reviewer.md`
- refactor -> `agents/refactorer.md`
- docs -> `agents/doc-writer.md`
- security -> `agents/security-auditor.md`

## Output expectations
For implementation tasks, respond with:
1. brief understanding of the task
2. short plan
3. changes made
4. test/update notes
5. risks or follow-ups if any

For debugging tasks, respond with:
1. observed problem
2. likely root cause
3. fix approach
4. validation steps

For review tasks, respond with:
1. summary
2. issues found
3. severity
4. suggested fixes
