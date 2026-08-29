export interface CompactTemplate {
    id: string;
    title: string;
    description: string;
    filename: string;
    code: string;
}

export const COMPACT_TEMPLATES: CompactTemplate[] = [
    {
        id: 'hello-world',
        title: 'Hello World Bulletin Board',
        description: 'Standard Midnight on-chain public bulletin board contract with disclosed state.',
        filename: 'hello-world.compact',
        code: `pragma language_version >= 0.23;

import CompactStandardLibrary;

// Public ledger state - stores the message visible on-chain
export ledger message: Opaque<"string">;

// Circuit to store a new message
export circuit storeMessage(newMessage: Opaque<"string">): [] {
  message = disclose(newMessage);
}
`,
    },
    {
        id: 'counter',
        title: 'Stateful Counter',
        description: 'Demonstrates mutable state variables, increments, and custom assertions.',
        filename: 'counter.compact',
        code: `pragma language_version >= 0.23;

import CompactStandardLibrary;

// On-chain counter tracking numeric invocations
export ledger count: Cell<Uint<32>>;

// Circuit to increment the counter
export circuit increment(by: Uint<32>): [] {
  assert by > 0 "Increment step must be greater than zero";
  count = count + by;
}

// Circuit to reset counter
export circuit reset(): [] {
  count = 0;
}
`,
    },
    {
        id: 'secret-witness',
        title: 'Zero-Knowledge Secret Validator',
        description: 'Demonstrates private witness inputs verified inside ZK circuits without revealing the secret.',
        filename: 'secret-validator.compact',
        code: `pragma language_version >= 0.23;

import CompactStandardLibrary;

// Public ledger state tracking verification status
export ledger verified: Cell<Boolean>;
export ledger commitHash: Cell<Bytes<32>>;

// Witness providing private preimage knowledge
witness secretPreimage(): Bytes<32>;

// ZK Circuit validating the witness against the commit hash
export circuit verifySecret(): [] {
  const secret = secretPreimage();
  assert sha256(secret) == commitHash "Secret does not match committed hash";
  verified = true;
}
`,
    },
    {
        id: 'blank',
        title: 'Blank Contract',
        description: 'Minimal starter template for creating your own Compact circuit.',
        filename: 'my-contract.compact',
        code: `pragma language_version >= 0.23;

import CompactStandardLibrary;

// Define your ledger state here
export ledger state: Cell<Uint<32>>;

// Define your ZK circuits here
export circuit run(): [] {
  state = state + 1;
}
`,
    },
];
