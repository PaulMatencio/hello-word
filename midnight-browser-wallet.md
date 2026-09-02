# Implementation Plan - Midnight Browser Wallet Connector & Zero-Seed Mode in Wallet Studio

Integrate the **Midnight DApp Connector (Midnight Lace Extension)** into the **Wallet Studio** and application context so users can connect their existing Midnight Preprod wallet and interact with smart contracts without ever exposing their 32-byte seed phrase or private keys.

---

## User Review Required

> [!IMPORTANT]
> - **Zero-Seed Security**: When connected via the Midnight Lace browser extension, private keys and seeds remain exclusively inside the user's extension. The application receives only public addresses and signs transactions through standard browser popups.
> - **Dual Mode Support**: Users can seamlessly switch between **"Browser Wallet (Lace Extension)"** (Seedless / Web3 Mode) and **"Dev Seed Keyring"** (Headless / Multi-role local testing mode with Alice, Bob, Charlie).

---

## Proposed Changes

### 1. DApp Connector Infrastructure
#### [NEW] [`src/infrastructure/midnight/midnight-dapp-connector.ts`](file:///home/paul/compact/midnight-compact-studio/src/infrastructure/midnight/midnight-dapp-connector.ts)
- Define TypeScript interfaces for `MidnightDAppConnector`, `MidnightConnectedApi`, and `ExtensionWalletState`.
- Implement `isMidnightExtensionInstalled()` to safely detect `window.midnight?.mnLace`.
- Implement `connectMidnightLaceWallet()` to invoke `mnLace.enable()`, retrieve addresses, and query on-chain balances.

---

### 2. Context & State Management
#### [MODIFY] [`src/presentation/context/WalletContext.tsx`](file:///home/paul/compact/midnight-compact-studio/src/presentation/context/WalletContext.tsx)
- Add state fields:
  - `connectionMode: 'extension' | 'seed'`
  - `isExtensionInstalled: boolean`
  - `isExtensionConnected: boolean`
  - `extensionApi: MidnightConnectedApi | null`
  - `connectExtensionWallet(): Promise<boolean>`
  - `disconnectExtensionWallet(): void`
- Adapt balance syncing to support both extension addresses and local seed identities.

---

### 3. Wallet Studio UI & User Experience
#### [MODIFY] [`components/WalletStudio.tsx`](file:///home/paul/compact/midnight-compact-studio/components/WalletStudio.tsx)
- Add a top **Wallet Mode Switcher**:
  - 🔌 **Browser Wallet (Lace Extension)**: Seedless connection with 1-click "Connect Midnight Wallet", live connection badge, zero-seed security shield, address copy, and explorer links.
  - 🔑 **Dev Seed Keyring**: Multi-role preset selector (Deployer / Alice / Bob / Charlie) and manual hex seed manager for development.
- Include an informative install banner with direct link to the Midnight Lace Extension when the extension is not yet detected in the browser.

---

## Verification Plan

### Automated Tests
- Run `npm test` to verify all existing Vitest test suites (contracts, bulletin-board, counter, hello-world, use cases) pass without regressions.

### Manual Verification
1. Open the **Wallet Studio** (`/wallet`).
2. Verify the **"Browser Wallet"** tab displays:
   - "Connect Midnight Wallet" button.
   - Information banner explaining zero-seed security.
   - Status indicators (Detected vs Not Detected).
3. Toggle between **"Browser Wallet"** and **"Dev Seed Keyring"** modes and verify state consistency.
4. Verify balance cards, DUST generation indicators, and quick links to the Midnight Preprod Faucet.
