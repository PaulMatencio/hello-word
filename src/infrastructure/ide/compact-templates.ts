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
    title: 'Hello World',
    description: 'Standard Midnight on-chain public hello board contract with disclosed state.',
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
    id: 'bulletin-board',
    title: 'Bulletin Board',
    description: 'State-managed Zero-Knowledge bulletin board with owner commitment tag, postMessage, and takeDown circuits.',
    filename: 'bulletin-board.compact',
    code: `pragma language_version >= 0.23;

import CompactStandardLibrary;

export enum State {
  VACANT,
  OCCUPIED
}

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;
export ledger sequence: Counter;
export ledger owner: Bytes<32>;

// Private witness supplying caller's secret key
witness localSecretKey(): Bytes<32>;

/**
 * Initializes bulletin board to VACANT state with sequence counter at 1.
 */
constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
  owner = pad(32, "");
  sequence.increment(1);
}

/**
 * Internal helper to derive an owner verification tag in ZK.
 */
circuit deriveOwnerTag(sk: Bytes<32>, seq: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([
    pad(32, "bboard:pk:"), 
    seq, 
    sk
  ]);
}

/**
 * Posts a message to a VACANT board or updates the message if called by current owner.
 */
export circuit postMessage(newMessage: Opaque<"string">): [] {
  if (state == State.VACANT) {
    const currentSeq = sequence as Field as Bytes<32>;
    const tag = deriveOwnerTag(localSecretKey(), currentSeq);

    owner = disclose(tag);
    message = disclose(some<Opaque<"string">>(newMessage));
    state = State.OCCUPIED;
    // Advance sequence for subsequent transitions
    sequence.increment(1);
  } else {
    // Board is OCCUPIED: verify existing ownership using the current sequence state
    const currentTag = owner;
    const computedTag = deriveOwnerTag(localSecretKey(), ((sequence as Field) - 1) as Bytes<32>);
    assert(currentTag == computedTag, "Only the current owner can edit the post");
    
    // Update message
    message = disclose(some<Opaque<"string">>(newMessage));
    
    // Advance sequence and update owner tag for forward privacy/unlinkability
    const nextSeq = sequence as Field as Bytes<32>;
    owner = disclose(deriveOwnerTag(localSecretKey(), nextSeq));
    sequence.increment(1);
  }
}

/**
 * Takes down an existing post. Only callable by current owner.
 */
export circuit takeDown(): Opaque<"string"> {
  assert(state == State.OCCUPIED, "Attempted to take down post from an empty board");
  assert(message.is_some, "Corrupted state: post is occupied but message is empty");

  // Verify ownership tag using the sequence index at which the post was last written
  const expectedTag = deriveOwnerTag(localSecretKey(), ((sequence as Field) - 1) as Bytes<32>);
  assert(owner == expectedTag, "Attempted to take down post, but not the current owner");

  const formerMsg = message.value;
  
  state = State.VACANT;
  message = none<Opaque<"string">>();
  owner = pad(32, "");
  sequence.increment(1);

  return formerMsg;
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
export ledger count: Uint<32>;

constructor() {
  count = 0;
}

// Circuit to increment the counter
export circuit increment(by: Uint<32>): [] {
  assert(by > 0, "Increment step must be greater than zero");
  count = (count + disclose(by)) as Uint<32>;
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
export ledger verified: Boolean;
export ledger commitHash: Bytes<32>;

// Witness providing private preimage knowledge
witness secretPreimage(): Bytes<32>;

constructor(initialHash: Bytes<32>) {
  verified = false;
  commitHash = disclose(initialHash);
}

// Set commitment hash
export circuit setCommitHash(newHash: Bytes<32>): [] {
  commitHash = disclose(newHash);
  verified = false;
}

// ZK Circuit validating the private witness preimage against the commitment hash
export circuit verifySecret(): [] {
  const secret = secretPreimage();
  assert(persistentHash<Bytes<32>>(secret) == commitHash, "Secret does not match committed hash");
  verified = true;
}
`,
  },
  {
    id: 'blank',
    title: 'Blank Contract',
    description: 'Clean starter with language pragma and Compact standard library.',
    filename: 'my-contract.compact',
    code: `pragma language_version >= 0.23;

import CompactStandardLibrary;
`,
  },
];
