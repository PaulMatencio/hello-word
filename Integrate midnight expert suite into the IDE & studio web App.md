# Implementation Plan: Integrate Midnight Expert Suite into IDE & Studio Web App

Integrate the **Midnight Expert** ecosystem into both:
1. **Part A (Antigravity IDE Workspace):** Configure `.agents/` inside the repository so that Antigravity discovers the Midnight Expert skills, MCP servers (`octocode-mcp`), and rules locally within the workspace.
2. **Part B (Midnight Compact Studio Web App):** Add an **Ecosystem Tools & Diagnostics** suite directly into the studio web interface, featuring a **Status Codes & Error Diagnostic Directory**, a **Devnet/Proof-Server Doctor**, a **Compact Contract Template Library**, and new Web CLI commands.

---

## User Review Required

> [!NOTE]
> All existing contract editing, wallet connection, and deployment workflows remain 100% untouched. The new web features add dedicated tools and template discovery to empower your Midnight development.

---

## Proposed Changes

### Part A: Antigravity IDE Workspace (`.agents/`)

Setup repository-level customization files in `/home/paul/compact/midnight-compact-studio/.agents/`:

#### [NEW] [mcp_config.json](file:///home/paul/compact/midnight-compact-studio/.agents/mcp_config.json)
- Define `octocode-mcp` (`npx -y octocode-mcp`) at the workspace level.

#### [NEW] [.agents/plugins/](file:///home/paul/compact/midnight-compact-studio/.agents/plugins/)
- Symlink the 16 Midnight Expert plugins from `~/.claude/plugins/cache/midnight-expert/` into the local `.agents/plugins/` directory.

#### [NEW] [.agents/rules/compact-rules.md](file:///home/paul/compact/midnight-compact-studio/.agents/rules/compact-rules.md)
- Define Compact contract guidelines (e.g. pragma versions, witness context pattern, transient vs persistent hashes, disclosure rules) derived from `compact-core`.

---

### Part B: Midnight Compact Studio Web Application

#### [NEW] [app/api/diagnostics/codes/route.ts](file:///home/paul/compact/midnight-compact-studio/app/api/diagnostics/codes/route.ts)
- Fast JSON API endpoint to search the 464 verified Midnight status codes, node error codes, SDK exceptions, and Compact compiler diagnostics.
- Supports search by code number, keyword, category, or source component (`midnight-node`, `compact`, `wallet-sdk`, `proof-server`).

#### [NEW] [app/api/diagnostics/doctor/route.ts](file:///home/paul/compact/midnight-compact-studio/app/api/diagnostics/doctor/route.ts)
- Comprehensive doctor diagnostic endpoint probing:
  - Local / remote Node RPC connectivity and sync state
  - Indexer GraphQL readiness & websocket endpoint
  - Proof Server `/ready` / `/health` worker status
  - Compact compiler CLI toolchain availability and version check
  - Network latency benchmarks

#### [NEW] [app/api/contracts/templates/route.ts](file:///home/paul/compact/midnight-compact-studio/app/api/contracts/templates/route.ts)
- Returns curated Compact contract templates from `compact-examples` (e.g., `ShieldedERC20`, `MultiToken`, `Ownable`, `Pausable`, `SealedBidAuction`, `BulletinBoard`, `CryptoKitties`).

#### [NEW] [app/tools/page.tsx](file:///home/paul/compact/midnight-compact-studio/app/tools/page.tsx)
- Premium "Tools & Diagnostics" studio page containing:
  - **Doctor Health Dashboard**: Real-time diagnostic cards for Node, Indexer, Proof Server, and Compact CLI with one-click re-test.
  - **Midnight Status Codes Directory**: Interactive search filter, category badges, error explanations, and recommended fixes/remedies.
  - **Compact Contract Templates Explorer**: Filter by category (Tokens, Security, Access Control, Applications), view code preview, and 1-click **"Load into IDE"** button that sends the template straight into the Studio editor.

#### [MODIFY] [components/Sidebar.tsx](file:///home/paul/compact/midnight-compact-studio/components/Sidebar.tsx)
- Add the **"Tools & Doctor"** navigation item with an icon (e.g., `Wrench` or `Stethoscope`) and description to both desktop and mobile sidebars.

#### [MODIFY] [components/Navbar.tsx](file:///home/paul/compact/midnight-compact-studio/components/Navbar.tsx)
- Add `/tools` route metadata (`title: 'Tools & Diagnostics', subtitle: 'Midnight Expert Suite & Network Doctor'`).

#### [MODIFY] [components/WebTerminal.tsx](file:///home/paul/compact/midnight-compact-studio/components/WebTerminal.tsx)
- Add terminal commands:
  - `doctor`: Runs full ecosystem diagnostic scan and prints formatted terminal report.
  - `codes <query>`: Fast CLI lookup for any Midnight error code or diagnostic.
  - `templates`: Lists available Compact templates with their categories.

---

## Verification Plan

### Automated Verification
1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
2. **Unit Tests**:
   ```bash
   npm test
   ```
3. **API Endpoint Testing**:
   - `curl http://localhost:3000/api/diagnostics/codes?q=network`
   - `curl http://localhost:3000/api/diagnostics/doctor`
   - `curl http://localhost:3000/api/contracts/templates`

### Manual Verification
- Open `midnight-compact-studio` in browser.
- Navigate to the new **Tools & Diagnostics** page.
- Test searching for Midnight error codes (e.g., code `0`, `NetworkId`, `witness`, `proof`).
- Test loading a Compact template into the Studio IDE editor.
- Test running `doctor` and `codes` inside the Web CLI terminal.
