/**
 * Quickstart Example: ConditionalRealEstateEscrowContingencySettlement Client SDK
 *
 * How to run:
 *   npx tsx examples/conditional-real-estate-escrow-contingency-settlement-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext
} from '@midnight-ntwrk/compact-runtime';
import {
  ConditionalRealEstateEscrowContingencySettlementClient,
  type ConditionalRealEstateEscrowContingencySettlementPrivateState,
  EscrowStatus
} from '../src/client/conditional-real-estate-escrow-contingency-settlement-sdk.js';

// Helper to derive simulated 32-byte hash (for mock demo setup)
function mockHash(seed: string): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < seed.length && i < 32; i++) {
    bytes[i] = seed.charCodeAt(i);
  }
  return bytes;
}

async function main() {
  console.log('=== Conditional Real Estate Escrow Contingency Settlement Demo ===\n');

  // 1. Setup mock public key strings and contract addresses (32-byte hex strings in Midnight runtime)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  // 2. Define off-chain private keys for actors
  const buyerSecret = new Uint8Array(32).fill(0xaa);
  const sellerSecret = new Uint8Array(32).fill(0xbb);
  const inspectorSecret = new Uint8Array(32).fill(0xcc);
  const titleAgentSecret = new Uint8Array(32).fill(0xdd);

  // In production, these public keys match persistentHash<Bytes<32>>(secret)
  // For the simulator context, we align the seeds:
  const buyerPk = buyerSecret;
  const sellerPk = sellerSecret;
  const inspectorPk = inspectorSecret;
  const titleAgentPk = titleAgentSecret;
  const propertyHash = mockHash('Parcel #1094-RealEstate-BeverlyHills');

  const purchasePrice = 1_250_000_000_000n; // Micro-units
  const escrowDeposit = 50_000_000_000n;

  // 3. Initialize private state container
  let currentPrivateState: ConditionalRealEstateEscrowContingencySettlementPrivateState = {
    buyerSecret,
    sellerSecret,
    inspectorSecret,
    titleAgentSecret,
  };

  // 4. Initialize client SDK
  const client = new ConditionalRealEstateEscrowContingencySettlementClient();

  // 5. Construct Initial Contract State
  const constructorCtx = createConstructorContext(
    currentPrivateState,
    coinPublicKey
  );

  // In Midnight runtime, constructor parameters are passed during constructor execution
  const initResult = client.initialState(constructorCtx);
  currentPrivateState = initResult.currentPrivateState;
  let currentChargedState = initResult.currentContractState.data;

  console.log('Contract initialized successfully.');
  let state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Initial Status: ${EscrowStatus[state.status]} (Code: ${state.status})`);
  console.log(`Inspection Passed: ${state.inspectionPassed}, Title Cleared: ${state.titleCleared}\n`);

  // 6. Buyer Deposits Earnest Money
  console.log('--- Step 1: Buyer deposits earnest money ---');
  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  
  let result = client.depositEarnestMoney(circuitCtx, escrowDeposit);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Updated Escrow Status: ${EscrowStatus[state.status]}\n`);

  // 7. Inspector Submits Inspection Report
  console.log('--- Step 2: Inspector passes physical inspection ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.submitInspectionReport(circuitCtx, true);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Inspection Contingency Status: ${state.inspectionPassed}\n`);

  // 8. Buyer Confirms Loan/Financing Approval
  console.log('--- Step 3: Buyer confirms mortgage approval ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.confirmFinancingApproval(circuitCtx, true);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Financing Contingency Status: ${state.financingApproved}\n`);

  // 9. Title Agent Clears Title
  console.log('--- Step 4: Title Agent submits title clearance ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.submitTitleClearance(circuitCtx, true);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Title Cleared Status: ${state.titleCleared}\n`);

  // 10. Settle Escrow
  console.log('--- Step 5: Final Settlement Execution ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.settleEscrow(circuitCtx);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Final Escrow Lifecycle Status: ${EscrowStatus[state.status]}`);
  console.log('Transaction finalized without leaking private credentials!');
}

main().catch(console.error);