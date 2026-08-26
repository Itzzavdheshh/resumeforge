# ResumeForge — Documentation Index

ResumeForge is a browser-based LaTeX resume/CV workspace. Users write LaTeX in the browser, compile it on the server, and view the resulting PDF — no local TeX installation required (in the target production version).

---

## How to use this documentation

If you are **joining the project for the first time**, read in this order:

1. `PROJECT_STATE.md` — current status of the project (most important)
2. `OVERVIEW.md` — product vision and goals
3. `ARCHITECTURE.md` — technical architecture (current and planned)
4. `ROADMAP.md` — phased development plan

If you are **implementing a feature**, also read:

5. `FRONTEND.md` — frontend components and patterns
6. `BACKEND.md` — API routes and compilation logic
7. `API.md` — all API endpoint specifications
8. `REQUIREMENTS.md` — product requirements by priority

If you are **debugging or auditing**, read:

9. `SECURITY.md` — known risks and mitigations
10. `COMPILER.md` — LaTeX compilation details
11. `TESTING.md` — how to run and test the project
12. `DECISIONS.md` — architectural decisions log

For **design and UX**:

13. `UI_DESIGN.md` — visual design reference
14. `UX.md` — user experience flows and friction points

For **history and planning**:

15. `DEVELOPMENT_LOG.md` — chronological change log
16. `DATABASE.md` — current and planned data storage
17. `PROJECT_STRUCTURE.md` — repository layout
18. `FUTURE_IMPROVEMENTS.md` — ideas for future enhancement

---

## Documentation maintenance rules

- **Never mark something as IMPLEMENTED unless it actually is.**
- Use labels: `IMPLEMENTED`, `PARTIALLY IMPLEMENTED`, `PLANNED`, `UNKNOWN`, `DEPRECATED`.
- When a feature changes, update ALL affected files.
- `PROJECT_STATE.md` must always reflect the CURRENT cumulative state.
- `DEVELOPMENT_LOG.md` must get a new entry after every task/prompt.
- Documentation is the project's long-term memory — keep it accurate.

---

## Quick reference

| File | Purpose |
|------|---------|
| `PROJECT_STATE.md` | Cumulative project state — read this first |
| `OVERVIEW.md` | Vision, goals, target users |
| `ARCHITECTURE.md` | Current and planned technical architecture |
| `FRONTEND.md` | React/Next.js frontend details |
| `BACKEND.md` | API routes, compilation, filesystem |
| `API.md` | API endpoint specifications |
| `DATABASE.md` | Storage and data model |
| `COMPILER.md` | LaTeX compiler details |
| `SECURITY.md` | Security risks and mitigations |
| `REQUIREMENTS.md` | Product requirements by priority |
| `ROADMAP.md` | Phased development plan |
| `UI_DESIGN.md` | Visual design reference |
| `UX.md` | User experience flows |
| `PROJECT_STRUCTURE.md` | Repository layout |
| `TESTING.md` | How to run and test |
| `DECISIONS.md` | Architectural decision log |
| `DEVELOPMENT_LOG.md` | Chronological change history |
| `FUTURE_IMPROVEMENTS.md` | Ideas for future work |
