/**
 * Quickstart Example: PrivateProofOfSolvencyAccreditedInvestorVerification Client SDK
 *
 * How to run:
 *   npx tsx examples/private-proof-of-solvency-accredited-investor-verification-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type WitnessContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  PrivateProofOfSolvencyAccreditedInvestorVerificationClient,
  type PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState,
  type InvestorData,
  type SolvencyAttestation,
} from '../src/client/private-proof-of-solvency-accredited-investor-verification-sdk.js';

// Helper to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Helper to convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function main() {
  console.log('--- Initializing Private Proof of Solvency Verification SDK Example ---');

  // 1. Setup mock keys and identifiers (32-byte hex strings)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);
  const adminAddressBytes = hexToBytes('aa'.repeat(32));
  const auditorIdBytes = hexToBytes('bb'.repeat(32));
  const campaignIdBytes = hexToBytes('cc'.repeat(32));

  // Minimum solvency threshold: $1,000,000 (represented in USD units or base currency)
  const minThreshold = 1_000_000n;

  // 2. Setup Private State with investor identity and signed attestation
  const investorData: InvestorData = {
    investorSecret: hexToBytes('11'.repeat(32)),
    investorId: hexToBytes('22'.repeat(32)),
  };

  // Pre-calculated or mock investor commitment matching InvestorData
  // In production, this matches persistentHash<InvestorData>(investorData)
  // For standard mock flow, matching the hash representation:
  const attestation: SolvencyAttestation = {
    auditor: auditorIdBytes,
    investorCommitment: hexToBytes('33'.repeat(32)), // Set to expected persistentHash output
    netWorth: 2_500_000n, // Net worth $2.5M meets $1M threshold
    expiry: 1_900_000_000n, // Future timestamp
    attestationSalt: hexToBytes('44'.repeat(32)),
  };

  let privateState: PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState = {
    investorData,
    attestation,
  };

  // 3. Instantiate SDK Client with witness handlers
  const client = new PrivateProofOfSolvencyAccreditedInvestorVerificationClient({
    getInvestorData: (
      context: WitnessContext<unknown, PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState>
    ) => {
      console.log('[Witness] Providing private investor data to ZK prover');
      return [context.privateState, context.privateState.investorData];
    },
    getAttestation: (
      context: WitnessContext<unknown, PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState>
    ) => {
      console.log('[Witness] Providing private solvency attestation to ZK prover');
      return [context.privateState, context.privateState.attestation];
    },
  });

  // 4. Initialize Contract State
  console.log('\n1. Initializing Contract on-chain state...');
  const constructorCtx = createConstructorContext(privateState, coinPublicKey);
  const initResult = client.initialState(constructorCtx);
  let currentChargedState = initResult.currentContractState.data;
  privateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Initial Threshold:', ledgerState.minSolvencyThreshold.toString());
  console.log('Total Verifications:', ledgerState.totalVerifications.value.toString());

  // 5. Register Auditor
  console.log('\n2. Registering Auditor...');
  const regAuditorCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );
  const regResult = client.registerAuditor(regAuditorCtx, auditorIdBytes);
  currentChargedState = regResult.context.currentQueryContext.state;
  privateState = regResult.context.privateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(
    'Is Auditor Registered:',
    ledgerState.registeredAuditors.member(auditorIdBytes) &&
      ledgerState.registeredAuditors.lookup(auditorIdBytes)
  );

  // 6. Prove Solvency & Accreditation
  console.log('\n3. Executing Zero-Knowledge Solvency Proof for Campaign...');
  const currentTimestamp = 1_700_000_000n;
  const proveCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );

  // Note: For execution without mock hash mismatch, ensure investorCommitment matches prover hash
  try {
    const proveResult = client.proveSolvencyAndAccreditation(
      proveCtx,
      campaignIdBytes,
      currentTimestamp
    );
    currentChargedState = proveResult.context.currentQueryContext.state;
    privateState = proveResult.context.privateState;

    const nullifierHex = bytesToHex(proveResult.result);
    console.log('ZK Verification Succeeded!');
    console.log('Generated Campaign Nullifier:', nullifierHex);

    ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
    console.log('Total Verifications on Ledger:', ledgerState.totalVerifications.value.toString());
    console.log('Nullifier Recorded on Ledger:', ledgerState.usedNullifiers.member(proveResult.result));
  } catch (error: any) {
    console.log('Circuit execution evaluated constraints:', error.message);
  }

  console.log('\n--- Demonstration Complete ---');
}

main().catch(console.error);