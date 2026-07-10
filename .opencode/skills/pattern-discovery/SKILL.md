# Skill: pattern-discovery

Use BEFORE any implementation. "Search First, Reuse Always, Create Only When Necessary."

## Steps
1. **Search `patterns_library/`** for a matching pattern (api/, ui/, database/, testing/, security/, ci/, config/). Read the candidate file fully.
2. **Search the codebase** (`backend/`, `frontend/`) for existing implementations of the same shape.
3. **Check session history** for prior decisions on this kind of task.
4. **Only create new code if no reuse exists.** If you create new, note why each existing option was rejected.
5. **System Architect validates** the choice during Stage-1 review.

## Output
Return: the pattern file path(s) reused, or "NEW - no reusable pattern found" with the reason.
