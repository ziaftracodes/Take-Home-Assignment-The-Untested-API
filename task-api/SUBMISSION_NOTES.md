# Submission Notes

Here are a few quick notes on the assignment.

**What I'd test next if I had more time:**
- **Concurrency & Race Conditions:** Even though it's an in-memory store, I would write tests simulating simultaneous updates to the same task to ensure no data is lost.
- **Validation Edge Cases:** Testing very large strings, weird characters in strings (like emojis or HTML injection), and strictly ensuring that extra undocumented fields in the request body are either rejected or safely ignored.

**Anything that surprised me in the codebase:**
- The pagination logic simply multiplied `page * limit` for the offset, meaning page 1 was skipping the first batch entirely.
- The loose string matching on `.includes()` for status filtering in `taskService.getByStatus`. This approach risks matching partial strings (e.g., filtering `do` would return both `todo` and `done`).
- The hardcoded reset of `priority` to `'medium'` inside `taskService.completeTask()`. Completing a task should ideally not tamper with its priority level.

**Any questions I'd ask before shipping this to production:**
- **Storage:** Should we persist data? If so, what database are we moving to? This in-memory solution won't survive server restarts or scale across multiple instances.
- **Authentication & Authorization:** Currently, anyone can edit or delete any task. How should we secure these endpoints and tie tasks to specific users?
- **Pagination Strategy:** Should we use cursor-based pagination instead of offset-based? Offset-based pagination can have performance issues at scale and can result in missed/duplicated items if tasks are added/removed while paginating.

**Deployment Note for the Reviewer:**
This API is currently hosted on a free instance (e.g., Render). Please note that free instances spin down after 15 minutes of inactivity. Because this API uses an **in-memory data store**, any tasks created will be cleared when the server spins down and restarts upon the next request.
