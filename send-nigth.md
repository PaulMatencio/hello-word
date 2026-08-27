# Send tNIGHT Feature Implementation Plan

## Goal Description
Add a new button next to the existing Sync Monitor button in `WalletStudio.tsx` that allows the user to send tNIGHT tokens to an unshielded wallet (receiver) via an unshielded transaction. The button opens a modal/dialog where the user inputs the receiver address and amount, then confirms before broadcasting.

## User Review Required
> [!IMPORTANT]
> This feature introduces a new UI flow and transaction submission logic with user‑defined limits, confirmation step, and error handling. Please confirm the final UI design and any additional requirements.

## Open Questions (Answered)
- **User‑defined limit**: The modal will include a numeric input for the amount, and the user can set any amount up to a configurable maximum (default: full balance).
- **Confirmation step**: After the user fills the form and clicks **Send**, a confirmation dialog will appear summarising the transaction (receiver, amount) with **Confirm** and **Cancel** buttons.
- **Validation**: Before opening the confirmation step, the amount is validated to be > 0, ≤ user‑defined limit, and ≤ the wallet’s tNIGHT balance.
- **Error handling**: If the SDK reports insufficient balance or network errors after confirmation, an error toast will be shown and the modal will remain open for correction.

## Proposed Changes
---
### WalletStudio Component
#### [MODIFY] WalletStudio.tsx
- Add state hooks: `showSendModal`, `sendAmount`, `receiverAddress`, `sendError`, `isSending`.
- Add **Send tNIGHT** button (icon `Zap` or `Send`) next to Sync Monitor button with matching glass‑panel styling.
- Implement **SendModal** (inline component) containing:
  - Input for receiver Bech32 address (required).
  - Input for amount (tNIGHT) with validation against balance and a user‑defined limit (maxAmount, default to full balance).
  - **Next** button that triggers validation; if valid, opens a **ConfirmationDialog**.
- **ConfirmationDialog** displays transaction summary and **Confirm** / **Cancel** actions.
- On **Confirm**, call `sendUnshieldedTNight` from `midnight-service.ts` and handle loading state.
- Show success toast with transaction hash, or error toast with message (insufficient balance, network error, etc.).
- Close modal on success; keep it open on error for retry.

### Midnight Service
#### [MODIFY] src/lib/midnight-service.ts
- Add exported async function `sendUnshieldedTNight({ fromSeed, toAddress, amount })`:
  ```ts
  export async function sendUnshieldedTNight({
    fromSeed,
    toAddress,
    amount,
  }: { fromSeed: string; toAddress: string; amount: bigint }) {
    if (!wallet) throw new Error('Wallet not initialized');
    const balance = BigInt(walletStatus?.tNightBalance || '0');
    if (amount <= 0n) throw new Error('Amount must be greater than zero');
    if (amount > balance) throw new Error('Insufficient tNIGHT balance');

    const tx = await wallet.unshieldedTransfer({
      to: toAddress,
      amount,
      // fee omitted to let SDK estimate
    });
    const hash = await wallet.submitTransaction(tx);
    return hash;
  }
  ```
- The function validates amount > 0 and ≤ balance before creating the transaction, throwing descriptive errors.
- Propagate any network errors from `submitTransaction` up to the caller.

### UI/UX Enhancements
- Use existing Tailwind glass‑panel and dark‑mode design for modal and dialogs.
- Add subtle micro‑animations (fade‑in/out) for modal appearance.
- Include an `AlertTriangle` icon in the confirmation dialog if the scanner warning is active.

## Verification Plan
### Automated Tests
- Manual smoke test steps will be performed (no automated test suite yet):
  1. Open Wallet Studio, click **Send tNIGHT**.
  2. Enter a valid receiver and amount ≤ balance and ≤ limit → confirm → success toast, balance updates.
  3. Enter amount > balance → validation error before confirmation.
  4. Enter amount ≤ 0 → validation error.
  5. Simulate network failure (e.g., disconnect) → error toast after confirmation.

### Manual Verification
- Run `npm run dev`, interact with UI, ensure styling matches premium aesthetic.
- Verify transaction appears on MidnightScanner once the scanner syncs.
- Confirm toast messages are clear and the modal behaves correctly across error scenarios.

---
