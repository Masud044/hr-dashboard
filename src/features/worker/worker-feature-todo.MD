# Worker Feature — Deferred TODOs

Items intentionally skipped during initial build (low risk, small team, "fails safely" not "fails silently"). Revisit only if they actually cause a problem in real use — not proactively.

---

## Backend

### Worker module (`src/modules/worker/`)
- [ ] `STATUS` field accepts any number, not just 0/1. Add validation:
  ```js
  if (body.STATUS !== undefined && ![0, 1].includes(Number(body.STATUS))) {
    return res.status(400).json({ success: false, message: "STATUS must be 0 or 1." });
  }
  ```
- [ ] `deleteWorker` does a hard delete with no check for existing rate-history or attendance rows. Once those tables have real data, deleting a worker will orphan rows in `PM_WORKER_RATE_HISTORY` / `PM_WORKER_ATTENDANCE` (no FK to block it). Decide: block delete if dependent rows exist, or cascade-delete them too.

### Rate History module (`src/modules/worker-rate/`)
- [ ] Backdating a new rate before the current row's start date throws a raw Oracle error (`ORA-02290`, from `CHK_RATE_RANGE`) instead of a friendly message like "new rate date must be after the current rate's start date."
- [ ] Concurrent "set rate" requests for the same worker can both read "no open row" before either commits. The unique index (`UX_RATE_ONE_OPEN`) blocks the second one safely, but surfaces a raw `ORA-00001` instead of a clean message. Low risk with a small internal team.

### Attendance module (`src/modules/worker-attendance/`)
- [ ] `updateAttendance` does a `SELECT` then a separate `UPDATE` (two round trips, not atomic). If two people edit the same row at the same moment, the second save silently overwrites based on stale data ("last save wins," not corruption). Proper fix would be optimistic locking (version column or `UPDATED_DATE` check) — real complexity, skip unless this becomes a genuine multi-editor tool.

---

## Frontend

### Rate dialog (`src/features/worker/worker-rate-dialog.jsx`)
- [ ] No confirmation/preview before submitting — clicking "Set Rate" immediately closes the old rate and creates the new one. No "this will close your current rate as of [date]" preview step.
- [ ] No undo/edit for a mistaken rate entry. Only way to fix a wrong `EFFECTIVE_FROM` today is to set another new rate on top of it — corrects the *current* rate going forward, but leaves a messy extra row in history. Revisit once this actually happens in practice, since the right fix (delete-and-restore vs. direct edit) depends on how it comes up.

---

*Last updated: reflects state after Worker, Rate History, and Attendance modules (backend + frontend) were completed and reviewed.*