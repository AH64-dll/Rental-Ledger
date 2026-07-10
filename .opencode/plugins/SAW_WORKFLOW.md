# SAW Workflow Plugin (OpenCode surface)

> Loaded at the start of every OpenCode session in this project. Defines the
> SAFe Agentic Workflow adapted to OpenCode. Companion: `../../rental-ledger-plan.md`
> (product) and `.opencode/agents/*.md` (role prompts).

## 1. Roles (7 active for v1; 4 collapsed)

Active: BSA, System Architect, BE Developer, FE Developer, QAS, Security Engineer, ARCHitect-in-CLI.
Collapsed: RTE (you + OpenCode handle PRs), DPE, Data Engineer, Tech Writer, TDM.
HITL (merge authority) = the user.

## 2. Invoked-via

Roles are OpenCode custom agents at `.opencode/agents/<role>.md`, dispatched with the `task` tool using `subagent_type: <role>`. There are no slash commands.

## 3. The gated workflow (vNext contract)

1. User creates Linear ticket `RENT-N` with a one-line feature request.
2. OpenCode dispatches **BSA** → writes `specs/RENT-N-<slug>.md` (from `specs_templates/spec_template.md`), runs **pattern-discovery**, defines AC/DoD.
3. **STOP-THE-LINE GATE (hard, blocking):** before any implementation, the spec must have AC/DoD. If missing → stop, back to BSA.
4. OpenCode dispatches **BE Developer** and/or **FE Developer** on branch `rent-N-<slug>`. Exit state: "Ready for QAS".
5. **QAS** runs tests (`pytest` + `vitest`), posts evidence to the Linear ticket via the Linear MCP. May bounce back. Exit: "Approved for RTE".
6. (RTE collapsed) OpenCode opens the PR, assembles evidence in the PR body.
7. **3-STAGE PR REVIEW:**
   - Stage 1: **System Architect** → pattern/technical check.
   - Stage 2: **ARCHitect-in-CLI** → architecture/security check.
   - Stage 3: **User (HITL)** → review + MERGE.
8. Commits follow CONTRIBUTING.md: `feat(ledger): ... [RENT-N]`.

## 4. Invariants that never relax

Stop-the-Line gate, QAS independence (always a separate dispatch, never self-QA), Security Engineer independence, evidence in Linear, HITL merge authority.

## 5. Pattern Discovery Protocol (MANDATORY before implementation)

1. Search `patterns_library/`.
2. Search the codebase.
3. Check session history.
4. Only create new code if no reuse found.
5. System Architect validates the choice.

## 6. Linear integration

Linear MCP server is configured via `.opencode/mcp.json` (copied from the committed
`.opencode/mcp.example.json` template; the real file is gitignored to keep your key out of git).
It runs `@anthropic/linear-mcp-server` with `LINEAR_API_KEY` from the environment. Every gate
completion posts evidence (test output, status) as a Linear comment.
