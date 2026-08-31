# Implementation Plan: Bulletin Board Contract Workbench & Showcase Suite

Create an interactive **Bulletin Board Contract Workbench** in the web interface that simulates and executes the full Zero-Knowledge circuit showcase suite from [`examples/bulletin-board-example.ts`](file:///home/paul/compact/hello-word/examples/bulletin-board-example.ts).

---

## User Review Required

> [!IMPORTANT]
> The Bulletin Board Workbench will support both **1-Click Full Showcase Automation** (running all 6 steps sequentially with live animated logs) and **Manual Step-by-Step & Custom Circuit Execution** with identity switching between Alice and Bob.

---

## Proposed Changes

### Backend API

#### [NEW] [route.ts](file:///home/paul/compact/hello-word/app/api/contract/bulletin-board/showcase/route.ts)
- Implement endpoint `/api/contract/bulletin-board/showcase` to execute either:
  1. **All 6 showcases sequentially** (initial state $\to$ Alice post $\to$ Alice duplicate post rejection $\to$ Bob post rejection $\to$ Bob unauthorized takedown rejection $\to$ Alice authorized takedown).
  2. **Individual showcase steps** (1 through 6) or **custom circuit calls** (`post`, `takeDown`) with selected identity (Alice/Bob/custom).
- Returns structured step results, raw `ChargedState`, `PrivateState`, log messages, duration, and assertion outcomes.

---

### Frontend UI & Components

#### [NEW] [BulletinBoardWorkbench.tsx](file:///home/paul/compact/hello-word/components/BulletinBoardWorkbench.tsx)
- High-performance, rich interactive workbench component:
  - **Live Visual Bulletin Board**: Glowing VACANT / OCCUPIED badge, sequence counter `#1`, active message card, owner commitment tag, and private key tags.
  - **Showcase Pipeline Stepper**: Interactive cards for all 6 showcase scenarios with status indicators (Pending, Running, Passed, Expected Error Caught, Completed).
  - **Single-Click "Run All Showcases"**: Automated walkthrough with animated progress and live console output.
  - **Manual Circuit Execution Panel**: Identity switcher (Alice / Bob), circuit selection (`post`, `takeDown`), and custom input field.
  - **Terminal / Console Log Stream**: Colorized console output mirroring `examples/bulletin-board-example.ts`.
  - **State Inspector Tabs**: Decoded Ledger State, Raw ChargedState, and Alice/Bob PrivateState viewers.

#### [NEW] [page.tsx](file:///home/paul/compact/hello-word/app/contracts/bulletin-board/page.tsx)
- Dedicated route `/contracts/bulletin-board` hosting the Bulletin Board Workbench with breadcrumbs and direct link back to `/contracts` registry.

#### [MODIFY] [page.tsx](file:///home/paul/compact/hello-word/app/contracts/page.tsx)
- Add a prominent **"Bulletin Board Circuit Workbench & Showcase"** hero card on the Contracts registry page with quick launcher button.

---

## Verification Plan

### Automated Tests
- Run `npm test` to ensure existing Vitest test suites (hello-world and bulletin-board) continue to pass (6/6).
- Run `npm run build` to verify TypeScript compile safety.

### Manual Verification
- Test all 6 showcase steps via the API `/api/contract/bulletin-board/showcase`.
- Open `http://localhost:3000/contracts/bulletin-board` in the browser.
- Click **"Run All Showcases"** and verify live logs, state changes (VACANT $\to$ OCCUPIED $\to$ VACANT), sequence increments (`1` $\to$ `2`), and expected assertion catches for unauthorized actions.
