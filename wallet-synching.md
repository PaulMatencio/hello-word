There are three main reasons for this difference in behavior:

#### A. Persistent WebSocket Lifecycle vs Request-Scoped Re-initialization
* **In `cli.ts` (Script)**: A single long-lived Node.js process starts, establishes a persistent WebSocket connection to `wss://indexer.preprod.midnight.network/api/v4/graphql/ws`, and keeps the event loop active. Once it syncs, it stays synced.
* **In a Web App (API Routes)**: 
  * If a wallet instance is created on-demand inside an API route (or recreated when Next.js reloads modules), it must establish a new WebSocket handshake, subscribe to GraphQL topics, and query block checkpoints from scratch.
  * *Fix implemented*: We now attach the active wallet instance to `globalThis.__midnightWalletCache` in [`src/lib/midnight-service.ts`](file:///home/paul/compact/hello-word/src/lib/midnight-service.ts) so the wallet and its WebSocket connection stay continuously running in the background.

#### B. Tri-Wallet Synchronization Condition
In `@midnight-ntwrk/wallet-sdk`, `WalletFacade.isSynced` is only `true` when **all three child wallets** reach the chain tip:
1. **Unshielded Wallet** (`unshielded.progress.appliedId >= highestTransactionId`)
2. **Shielded Wallet** (`shielded.progress.appliedId >= highestTransactionId`)
3. **DUST Wallet** (`dust.progress.appliedId >= highestTransactionId`)

If any of the three is catching up on historical UTXO/nullifier trees, `waitForSyncedState()` will wait until all 3 synchronize.

#### C. Synchronous HTTP Blocking
If an API route runs `await wallet.waitForSyncedState()`, the browser HTTP request waits for 30–90 seconds before sending any response headers, making the UI appear frozen. Instead, the UI should poll the non-blocking `wallet.state()` stream.

---

### 2. How to Check That Syncing Is Actively Ongoing

The Midnight SDK exposes an active observable stream (`wallet.state()`) containing real-time progress metrics.

#### The State Structure:
```typescript
const state = await Rx.firstValueFrom(wallet.state());

// 1. Check WebSocket connection
console.log('Connected to Indexer:', state.unshielded.progress.isConnected);

// 2. Check current processed transaction vs chain tip
console.log('Applied ID:', state.unshielded.progress.appliedId);
console.log('Highest Network ID:', state.unshielded.progress.highestTransactionId);

// 3. Check individual child wallets
console.log('Shielded Progress:', state.shielded.progress.appliedId);
console.log('Dust Progress:', state.dust.progress.appliedId);

// 4. Overall synced flag
console.log('Is Fully Synced:', state.isSynced);
```

#### How to Stream Real-Time Sync Logs in Code:
```typescript
wallet.state().subscribe((s) => {
  const applied = s.unshielded.progress.appliedId;
  const highest = s.unshielded.progress.highestTransactionId;
  const percent = highest > 0n ? Number((applied * 100n) / highest) : 0;
  
  console.log(`[Sync Progress] ${percent}% (${applied}/${highest}) - Synced: ${s.isSynced}`);
});
```



### 3. Updates Added to the Next.js App

Update [`src/lib/midnight-service.ts`](file:///home/paul/compact/hello-word/src/lib/midnight-service.ts) and [`components/WalletStudio.tsx`](file:///home/paul/compact/hello-word/components/WalletStudio.tsx):

1. **Persistent Global Cache**: Wallet instances now persist across Fast Refresh and route calls via `globalThis.__midnightWalletCache`.
2. **Live Sync Telemetry in `/api/wallet/status`**: Returns `appliedId`, `highestTransactionId`, `isConnected`, and calculated `percentage`.
3. **UI Progress Badge**: The Wallet Studio badge now dynamically shows `Syncing... X% (applied / highest)` while catching up, and switches to `✓ Synced` as soon as it reaches 100%.