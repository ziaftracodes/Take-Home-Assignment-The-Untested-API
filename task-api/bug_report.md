# Bug Report

## 1. Pagination Offset Calculation

- **Expected Behavior:** When requesting `GET /tasks?page=1&limit=10`, the API should return the first 10 items (index 0 to 9).
- **Actual Behavior:** The API returns items starting from index 10. `page=1` skips the first `limit` items.
- **How I Discovered It:** By reading the code in `taskService.getPaginated`. The offset is calculated as `const offset = page * limit;`. 
- **Proposed Fix:** The offset should be calculated using `(page - 1) * limit` assuming `page` is 1-indexed. Alternatively, if `page` is 0-indexed, it should default to 0 in the router, but currently it defaults to `1` in `routes/tasks.js` (`const pageNum = parseInt(page) || 1;`), meaning it is intended to be 1-indexed.

## 2. Completing a Task Overwrites Priority

- **Expected Behavior:** When calling `PATCH /tasks/:id/complete`, the task should be marked as `done`, its `completedAt` set, but other fields like `priority` should remain unchanged.
- **Actual Behavior:** The priority is hardcoded to be reset to `'medium'` in `taskService.completeTask`.
- **How I Discovered It:** By reading `taskService.completeTask`. It sets `priority: 'medium'`.
- **Proposed Fix:** Remove `priority: 'medium'` from the `updated` object in `taskService.completeTask`.

## 3. Filtering by Status Uses Loose Matching

- **Expected Behavior:** When requesting `GET /tasks?status=todo`, the API should only return tasks where `status` is exactly `'todo'`.
- **Actual Behavior:** The API uses `t.status.includes(status)` in `taskService.getByStatus`. This means filtering by `status=do` would return both `todo` and `done` tasks.
- **How I Discovered It:** By reading `taskService.getByStatus`.
- **Proposed Fix:** Change `t.status.includes(status)` to `t.status === status`.
