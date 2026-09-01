/**
 * Private Proof of Solvency & Accredited Investor Verification TypeScript SDK
 *
 * Implements client-side abstractions, witness handlers, and typed circuit invocations
 * for the Private Proof of Solvency & Accredited Investor Verification Compact smart contract.
 *
 * @packageDocumentation
 */

import {
  type CircuitContext,
  type QueryContext,
  type WitnessContext,
  type ConstructorContext,
  type ConstructorResult,
  type CircuitResults,
  type StateValue,
  type ChargedState,
} from '@midnight-ntwrk/compact-runtime';

import {
  Contract as ManagedContract,
  ledger,
  type Witnesses as ContractWitnesses,
  type Ledger as ContractLedger,
} from '../../contracts/managed/private-proof-of-solvency-accredited-investor-verification/contract/index.js';

/**
 * Off-chain private identity information of the investor.
 */
export interface InvestorData {
  /** 32-byte secret known only to the investor */
  investorSecret: Uint8Array;
  /** 32-byte unique identity identifier */
  investorId: Uint8Array;
}

/**
 * Off-chain certified solvency attestation issued by an authorized auditor.
 */
export interface SolvencyAttestation {
  /** 32-byte public identifier of the issuing auditor */
  auditor: Uint8Array;
  /** 32-byte commitment of the investor (hash of InvestorData) */
  investorCommitment: Uint8Array;
  /** Verified net worth value */
  netWorth: bigint;
  /** Expiration timestamp (Unix epoch) */
  expiry: bigint;
  /** Random 32-byte salt for attestation uniqueness */
  attestationSalt: Uint8Array;
}

/**
 * Preimage used to compute the anonymous nullifier.
 */
export interface NullifierPreimage {
  investorSecret: Uint8Array;
  campaignId: Uint8Array;
}

/**
 * Private state schema maintained off-chain by the investor client.
 */
export interface PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState {
  /** Private investor identity details */
  investorData: InvestorData;
  /** Signed solvency attestation */
  attestation: SolvencyAttestation;
}

/**
 * Type-safe interface for ledger state.
 */
export type PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState = ContractLedger;

/**
 * Strongly-typed witness functions interface for the SDK client.
 * Each witness returns a tuple of [nextPrivateState, witnessValue].
 */
export interface PrivateProofOfSolvencyAccreditedInvestorVerificationWitnesses<
  PS = PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
> {
  /**
   * Witness function supplying private investor data.
   */
  getInvestorData: (
    context: WitnessContext<PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState, PS>
  ) => [PS, InvestorData];

  /**
   * Witness function supplying private solvency attestation.
   */
  getAttestation: (
    context: WitnessContext<PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState, PS>
  ) => [PS, SolvencyAttestation];
}

/**
 * Production-grade client SDK for interacting with the Private Proof of Solvency Compact contract.
 */
export class PrivateProofOfSolvencyAccreditedInvestorVerificationClient<
  PS = PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Constructs an instance of the PrivateProofOfSolvencyAccreditedInvestorVerificationClient.
   *
   * @param witnesses - Object implementing the witness functions required by the contract.
   */
  constructor(witnesses: PrivateProofOfSolvencyAccreditedInvestorVerificationWitnesses<PS>) {
    const managedWitnesses: ContractWitnesses<PS> = {
      getInvestorData: (context) => witnesses.getInvestorData(context),
      getAttestation: (context) => witnesses.getAttestation(context),
    };
    this.contract = new ManagedContract<PS>(managedWitnesses);
  }

  /**
   * Computes the initial contract state upon deployment.
   *
   * @param context - The constructor context containing coin public key and private state.
   * @returns The constructor result containing contract state data, private state, and Zswap state.
   */
  public initialState(
    context: ConstructorContext<PS>,
    admin: Uint8Array,
    initialThreshold: bigint
  ): ConstructorResult<PS> {
    return this.contract.initialState(context, admin, initialThreshold);
  }

  /**
   * Registers or updates an authorized auditor on the public ledger.
   *
   * @param context - Circuit execution context.
   * @param auditor - 32-byte public identifier of the auditor.
   * @returns Circuit results with updated context and empty unit return tuple.
   */
  public registerAuditor(
    context: CircuitContext<PS>,
    auditor: Uint8Array
  ): CircuitResults<PS, []> {
    return this.contract.circuits.registerAuditor(context, auditor);
  }

  /**
   * Revokes an auditor's authorization on the public ledger.
   *
   * @param context - Circuit execution context.
   * @param auditor - 32-byte public identifier of the auditor to revoke.
   * @returns Circuit results with updated context and empty unit return tuple.
   */
  public revokeAuditor(
    context: CircuitContext<PS>,
    auditor: Uint8Array
  ): CircuitResults<PS, []> {
    return this.contract.circuits.revokeAuditor(context, auditor);
  }

  /**
   * Updates the minimum solvency threshold required for accreditation verification.
   *
   * @param context - Circuit execution context.
   * @param newThreshold - The new minimum net worth threshold.
   * @returns Circuit results with updated context and empty unit return tuple.
   */
  public updateThreshold(
    context: CircuitContext<PS>,
    newThreshold: bigint
  ): CircuitResults<PS, []> {
    return this.contract.circuits.updateThreshold(context, newThreshold);
  }

  /**
   * Proves in zero-knowledge that the investor meets the solvency threshold
   * and possesses a valid attestation without revealing balance or identity.
   *
   * @param context - Circuit execution context.
   * @param campaignId - 32-byte campaign identifier for replay prevention.
   * @param currentTimestamp - Current Unix epoch timestamp in seconds.
   * @returns Circuit results with updated context and the 32-byte campaign nullifier.
   */
  public proveSolvencyAndAccreditation(
    context: CircuitContext<PS>,
    campaignId: Uint8Array,
    currentTimestamp: bigint
  ): CircuitResults<PS, Uint8Array> {
    return this.contract.circuits.proveSolvencyAndAccreditation(
      context,
      campaignId,
      currentTimestamp
    );
  }

  /**
   * Decodes and formats raw state data into the strongly-typed ledger state.
   *
   * @param rawState - The raw state or charged state representation from query context or storage.
   * @returns The decoded strongly-typed ledger state.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}

/**
 * Factory helper to instantiate the default SDK client with standard private state accessor witnesses.
 *
 * @returns An initialized PrivateProofOfSolvencyAccreditedInvestorVerificationClient instance.
 */
export function createDefaultSolvencyClient(): PrivateProofOfSolvencyAccreditedInvestorVerificationClient<PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState> {
  return new PrivateProofOfSolvencyAccreditedInvestorVerificationClient<PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState>({
    getInvestorData: (
      context: WitnessContext<
        PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState,
        PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
      >
    ): [PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState, InvestorData] => {
      return [context.privateState, context.privateState.investorData];
    },
    getAttestation: (
      context: WitnessContext<
        PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState,
        PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
      >
    ): [PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState, SolvencyAttestation] => {
      return [context.privateState, context.privateState.attestation];
    },
  });
}