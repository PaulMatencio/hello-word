import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

const COMPACT_SYSTEM_PROMPT = `
You are an expert AI assistant specialized in the Midnight blockchain, the Compact smart contract programming language, and the Midnight.js TypeScript SDK.

### Midnight Compact Language Principles:
1. **State & Types**:
   - \`export ledger <var>: <Type>;\` declares public on-chain state stored on the ledger.
   - Types include: \`Cell<T>\`, \`Map<K, V>\`, \`Set<T>\`, \`Uint<N>\`, \`Bytes<N>\`, \`Boolean\`, \`String\`, \`Vector<N, T>\`, \`Maybe<T>\`, custom structs, and enums.
   - \`constructor(...) { ... }\` initializes ledger state.
2. **Witness Functions**:
   - Witnesses represent off-chain private computations / private state lookups.
   - Declaration: \`witness <name>(<args>): <ReturnType>;\`
   - CRITICAL WITNESS CONVENTION in TypeScript SDK: Witness functions in client runtime must return a 2-element tuple \`[nextPrivateState, witnessValue]\` (i.e. \`[PS, T]\`).
3. **Circuits**:
   - \`export circuit <name>(<args>): <ReturnType> { ... }\` defines ZK circuits executed on client and verified on-chain.
   - \`assert <condition>, "<error message>";\` enforces constraints and validates state transitions.
   - Circuits update ledger variables, call witnesses for private inputs, and compute ZK proofs.
   - \`disclose(<expr>)\` is used when revealing private data to the public ledger context.
   - \`kernel.self()\` returns the contract address.

### Midnight TypeScript Client SDK (@midnight-ntwrk/midnight-js-* & compact-runtime):
- Contract class: \`import { Contract, ledger, type Witnesses } from './contract/index.js';\`
- Construction: \`const contract = new Contract(witnesses);\`
- Contexts:
  - Constructor Context: \`CompactRuntime.createConstructorContext(privateState, coinPublicKey);\`
  - Initial State: \`const { currentContractState, currentPrivateState, currentZswapLocalState } = contract.initialState(constructorCtx);\`
  - Circuit Context: \`CompactRuntime.createCircuitContext(contractAddress, coinPublicKey, contractStateData, privateState);\`
- Invoking Circuits: \`const result = contract.circuits.<circuitName>(circuitContext, ...args);\`
- Reading state: \`const state = ledger(result.context.currentQueryContext.state.state);\`

When responding:
- Provide high-quality, idiomatic, clean code.
- When fixing errors, explain the root cause clearly and provide the exact corrected code snippet or replacement.
- When generating Midnight.js clients or Vitest test suites, ensure all imports, mock contexts, and witness tuples \`[PS, Value]\` are strictly type-safe.
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            prompt,
            action = 'chat',
            code = '',
            filename = 'contract.compact',
            diagnostics = [],
            compilerOutput = '',
            dtsContent = '',
            testOutput = '',
            model = 'gemini-3.7-flash',
            apiKey: userApiKey,
        } = body;

        const effectiveApiKey = userApiKey || process.env.GEMINI_API_KEY;

        if (!effectiveApiKey) {
            return NextResponse.json(
                {
                    error: 'MISSING_API_KEY',
                    message: 'Gemini API Key is not configured. Please enter your Google AI Studio API key in the AI Copilot settings or set GEMINI_API_KEY in your .env.local file.',
                },
                { status: 401 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        // Build context-aware prompt based on action
        let contextualPrompt = '';

        if (action === 'fix_error') {
            contextualPrompt = `
Task: Fix the following Compact compiler or runtime error.
Filename: ${filename}

Current Source Code:
\`\`\`compact
${code}
\`\`\`

Compiler / Diagnostic Output:
${compilerOutput || JSON.stringify(diagnostics, null, 2)}

${prompt ? `Additional user notes: ${prompt}` : ''}

Please:
1. Explain what caused the error.
2. Provide the complete fixed code block inside \`\`\`compact ... \`\`\`.
3. Highlight what changed and why.
`;
        } else if (action === 'generate_client') {
            const baseContractName = (filename || 'contract').replace(/\.compact$/, '');
            const pascalName = baseContractName
                .split('-')
                .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
                .join('');

            contextualPrompt = `
Task: Generate a production-grade TypeScript client SDK AND comprehensive technical documentation for this Midnight Compact smart contract.
Contract Filename: ${filename}

Compact Contract Source Code:
\`\`\`compact
${code}
\`\`\`

${dtsContent ? `Generated TypeScript Type Definitions (.d.ts):\n\`\`\`typescript\n${dtsContent}\n\`\`\`` : ''}

${prompt ? `Additional user requirements: ${prompt}` : ''}

Please structure your response into two distinct, high-quality deliverables:

### Part 1: Comprehensive SDK Documentation
Provide detailed, structured technical documentation covering:
1. **Contract Overview & Architecture**:
   - Explanation of the contract purpose.
   - Public Ledger State schema (\`export ledger ...\`) and data types.
   - Private State & Witness specification (\`witness ...\`) and security considerations.
   - Available Zero-Knowledge Circuits (\`export circuit ...\`) and their assertions/rules.
2. **Prerequisites & Installation**:
   - Required packages (\`@midnight-ntwrk/compact-runtime\`, etc.).
3. **API Reference**:
   - Method signatures, parameters, return types, and circuit error codes.
4. **Step-by-Step Quickstart & Usage Walkthrough**:
   - Provide a complete runnable TypeScript example script (intended for \`examples/${baseContractName}-example.ts\`).
   - The script MUST begin with a header comment showing how to run it:
     \`\`\`typescript
     /**
      * Quickstart Example: ${pascalName} Client SDK
      *
      * How to run:
      *   npx tsx examples/${baseContractName}-example.ts
      */
     \`\`\`
   - IMPORTANT: The example script MUST import the SDK adapter class directly from \`../src/client/${baseContractName}-sdk.js\` (e.g. \`import { ${pascalName}Client, type ${pascalName}PrivateState } from '../src/client/${baseContractName}-sdk.js';\`).
   - Use 32-byte hex strings for mock test addresses and keys: \`const coinPublicKey = '01'.repeat(32);\` and \`const contractAddress = '00'.repeat(32);\` (in Midnight.js runtime, \`coinPublicKey\` and \`contractAddress\` are hex strings, NOT \`Uint8Array\`).
   - Demonstrate: initializing contract state with \`createConstructorContext\`, tracking on-chain state via \`let currentChargedState = initResult.currentContractState.data\` (updated after circuit runs with \`currentChargedState = result.context.currentQueryContext.state\`), creating circuit contexts with \`createCircuitContext(contractAddress, coinPublicKey, currentChargedState, privateState)\`, and querying ledger state.
5. **Privacy & Security Notes**:
   - Off-chain witness handling, avoiding disclosure leaks, and key management.

### Part 2: Production TypeScript Client SDK Implementation
Provide the complete, strongly-typed TypeScript SDK file (intended for \`src/client/${baseContractName}-sdk.ts\`) inside a \`\`\`typescript ... \`\`\` code block that adheres strictly to Midnight.js / Compact runtime conventions:
1. Imports from \`@midnight-ntwrk/compact-runtime\`:
   \`import { type CircuitContext, type QueryContext, type WitnessContext, type ConstructorContext, type ConstructorResult, type CircuitResults, type StateValue, type ChargedState } from '@midnight-ntwrk/compact-runtime';\`
2. STRICTLY imports the compiled contract artifacts from:
   \`import { Contract as ManagedContract, ledger, type Witnesses as ContractWitnesses, type Ledger as ContractLedger } from '../../contracts/managed/${baseContractName}/contract/index.js';\` (NEVER use \`./contract/index.js\`).
3. Defines strict TypeScript interfaces for \`${pascalName}PrivateState\`, \`${pascalName}Witnesses<PS>\` (witness functions taking \`context: WitnessContext<ContractLedger, PS>\` where off-chain private state is accessed via \`context.privateState\` and returning 2-element tuples \`[PS, ReturnValue]\`), and \`${pascalName}LedgerState = ContractLedger\`.
4. Implements a high-level, production-ready \`${pascalName}Client\` class with:
   - \`initialState(context: ConstructorContext<PS>): ConstructorResult<PS>\` builder.
   - Type-safe circuit execution methods managing circuit contexts. (NOTE: Circuits with no return value in Compact return \`CircuitResults<PS, []>\` with the unit empty tuple \`[]\`, NOT \`void\`).
   - Strongly-typed ledger state query helper: \`queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): ${pascalName}LedgerState { return ledger(rawState as StateValue | ChargedState); }\`.
   - Comprehensive TSDoc inline comments.
`;
        } else if (action === 'generate_tests') {
            contextualPrompt = `
Task: Generate a comprehensive Vitest unit test suite for this Compact contract.
Contract Filename: ${filename}

Compact Contract Code:
\`\`\`compact
${code}
\`\`\`

${dtsContent ? `TypeScript Type Definitions (.d.ts):\n\`\`\`typescript\n${dtsContent}\n\`\`\`` : ''}

${prompt ? `Additional test cases requested: ${prompt}` : ''}

Please generate a complete Vitest test file (\`tests/contracts/${filename.replace(/\.compact$/, '')}.test.ts\`) that:
1. Uses \`vitest\` (\`describe\`, \`it\`, \`expect\`).
2. Creates deterministic mock keys and properly typed mock witnesses (\`createMockWitnesses = (sk: Uint8Array): Witnesses<any> => ({ ... })\`).
3. Uses \`CompactRuntime.createConstructorContext\` and \`CompactRuntime.createCircuitContext\` to simulate local circuit execution.
4. Tests contract initialization, positive state transitions for all circuits, and negative assertion failure cases (\`expect(...).toThrow(...)\`).
`;
        } else if (action === 'audit_zk') {
            contextualPrompt = `
Task: Conduct a Zero-Knowledge, Privacy, and Logic Audit for this Compact contract.
Filename: ${filename}

Compact Contract Code:
\`\`\`compact
${code}
\`\`\`

${prompt ? `User focus: ${prompt}` : ''}

Please review:
1. **Privacy & Witness Leakage**: Are private inputs disclosed inadvertently or inappropriately on the ledger?
2. **Circuit Constraints & Assertions**: Are all preconditions, bounds, and owner permissions strictly enforced with \`assert\`?
3. **State Machine Integrity**: Can the contract get stuck in an invalid state? Are sequence numbers or identifiers properly maintained?
4. **Actionable Recommendations**: Clear, specific improvements with code snippets.
`;
        } else if (action === 'explain') {
            contextualPrompt = `
Task: Explain this Compact smart contract and its ZK architecture.
Filename: ${filename}

Compact Contract Code:
\`\`\`compact
${code}
\`\`\`

${prompt ? `Specific question: ${prompt}` : ''}

Please explain:
1. **Contract Overview & Purpose**: What problem it solves and its main domain model.
2. **Public Ledger State**: What is recorded on-chain.
3. **Private Witness Computations**: What stays off-chain and private.
4. **Circuits & Transitions**: How users interact with it step-by-step.
`;
        } else {
            // General Chat
            contextualPrompt = `
Contract Filename: ${filename}

${code ? `Active Contract Code:\n\`\`\`compact\n${code}\n\`\`\`` : ''}
${compilerOutput ? `Recent Compiler Output:\n${compilerOutput}` : ''}
${testOutput ? `Recent Test Output:\n${testOutput}` : ''}

User Message:
${prompt}
`;
        }

        // Use selected model, default to gemini-3.7-flash
        const selectedModel = model || 'gemini-3.7-flash';

        const responseStream = await ai.models.generateContentStream({
            model: selectedModel,
            contents: contextualPrompt,
            config: {
                systemInstruction: COMPACT_SYSTEM_PROMPT,
                temperature: action === 'chat' ? 0.4 : 0.2,
            },
        });

        // Set up streaming response
        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        const text = chunk.text;
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (err: any) {
                    controller.error(err);
                }
            },
        });

        return new Response(customStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error: any) {
        console.error('Gemini AI API Error:', error);
        return NextResponse.json(
            {
                error: 'AI_GENERATION_FAILED',
                message: error?.message || 'Failed to generate response from Gemini Flash.',
            },
            { status: 500 }
        );
    }
}
