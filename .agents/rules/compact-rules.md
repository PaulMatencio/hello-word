# Compact Smart Contract Guidelines for Midnight Network

## 1. Compiler Pragma & Standard Library
- Always define `pragma language_version >= 0.22;` at the top of `.compact` contracts.
- Import standard utilities from `CompactStandardLibrary` when available (e.g. `Maybe`, `Either`, `persistentHash`, `transientHash`).

## 2. Privacy & Disclosure
- Local witnesses cannot directly write to public ledger state without explicit disclosure.
- When passing private or witness-derived state to a public ledger state write, declare it via `disclose()`.
- Use `transientCommit` or `transientHash` for temporary secret bindings within circuit constraints.
- Use `persistentCommit` or `persistentHash` when the hash digest will be stored on-chain in public ledger state.

## 3. Witness Implementation
- Compact witness functions implemented in TypeScript must accept a `WitnessContext<Ledger, PrivateState>` as the first argument.
- Witness functions must return a tuple `[PrivateState, ReturnValue]`. Never return a bare return value.
- Keep private state immutable; return new instances rather than mutating in place.

## 4. Token & Value Handling
- 1 NIGHT = 1,000,000 STAR ($10^6$).
- 1 DUST = 1,000,000,000,000,000 SPECK ($10^{15}$).
- Shielded tokens utilize nullifiers and Merkle commitments; unshielded tokens operate on UTXOs.
