# 🌌 Midnight Compact Studio — Full-Stack Zero-Knowledge DApp & Web IDE

A full-stack decentralized Zero-Knowledge application, in-browser development studio, and interactive CLI built for the **Midnight Network (Preprod)** using **Compact** smart contracts and **Next.js**.

---

## 🌟 Key Features

### 🛠️ In-Browser Compact Web Studio & IDE
- **Monaco Editor Integration**: Custom Monarch tokenizer providing full syntax highlighting, keyword completion, bracket matching, and error squiggles for the `.compact` language (version ≥ 0.23).
- **In-Browser Compilation**: Compile `.compact` source files into Zero-Knowledge circuits (`zkir`), proving keys (`keys/`), and TypeScript/JavaScript runtime modules (`contract/index.js` and `.d.ts`) directly from the UI.
- **Starter Templates**: One-click templates for rapid prototyping (Hello World Bulletin Board, Stateful Counter, Zero-Knowledge Secret Validator).
- **Workspace File Management**: Save, open, export, and load `.compact` files directly to/from your workspace directory via local API integration.
- **Fast Test Runner (`Ctrl+T`)**: Execute in-memory circuit unit tests in <100ms without network latency or DUST token consumption.
- **Direct Deployment Handoff**: Deploy freshly compiled contracts straight from the editor to Midnight Preprod with a single click.

---

### ✨ Gemini 3.7 Flash AI Copilot
Integrated directly into the Compact Web Studio, the AI Copilot accelerates smart contract development and security auditing:
- **Compact 0.23+ Rule Mastery**: Deeply grounded in Midnight Compact conventions, enforcing mandatory `disclose()` wrapping on ledger writes, parenthesized `assert(cond, msg)` constraints, and `persistentHash<T>` cryptographic primitives.
- **Automated Compiler Error Diagnosis & Auto-Fix**: Automatically ingests compiler diagnostic logs, pinpoints syntax/type mismatches, and generates complete, compilable fix diffs with one-click editor replacement.
- **TypeScript Client SDK Generation**: Automatically crafts production-grade client SDKs implementing `CompactRuntime` contexts (`createConstructorContext`, `createCircuitContext`, `WitnessContext`) and generates runnable example scripts (`examples/<contract>-example.ts`).
- **Vitest Unit Test Generation**: Scaffolds complete mock test suites (`tests/contracts/<contract>.test.ts`) with deterministic keys, witness mock tuples `[PS, T]`, positive transitions, and negative assertion failure assertions.
- **Zero-Knowledge Privacy & Logic Audits**: Audits contract source for unintentional witness leakage, underconstrained circuits, missing boundary assertions, and state machine anti-patterns.
- **Interactive Chat & Contract Explainer**: Explains on-chain ledger layouts, off-chain witness architectures, and circuit flow step-by-step.
- **Multi-Model Selector**: Toggle seamlessly between `gemini-3.7-flash` (default), `gemini-2.5-flash`, and `gemini-2.5-pro`.

---

### 🛡️ Formal Verification Engine (SMT-LIB2 / Z3)
A built-in symbolic verification analyzer for mathematically proving contract correctness before deploying on-chain:
- **Zero-Knowledge Witness Confidentiality**: Verifies cryptographic isolation ($\forall w \in \text{Witnesses}, \forall s \in \text{PublicLedgerState} : I(w; s \mid \text{disclose}(\text{expr})) = 0$) ensuring private witness data cannot be leaked without explicit disclosure.
- **Circuit Constraint Completeness & Soundness**: Ensures state transitions are mathematically constrained against arbitrary witness assignment attacks.
- **Inductive Ledger Monotonicity & Anti-Replay Safety**: Proves by induction that sequence counters and ledger invariants hold across arbitrary valid execution sequences.
- **Bounded Integer Arithmetic & Overflow Absence**: Proves that arithmetic operations on `Uint<N>` stay within typed bounds and conversions cannot silently overflow.
- **Cryptographic Authorization & Sentinel Security**: Formally checks that unauthorized parties cannot execute admin or owner-restricted circuits without valid cryptographic tags.
- **Exportable SMT-LIB2 Specifications**: Automatically generates formal SMT-LIB2 code formulas ready for standalone SMT solvers (Z3 / CVC5) and synthesizes mathematical invariant lemmas.

---

### 🔬 Interactive ZK Circuit Workbenches
- **Dedicated Contract Workbenches**: Interactive visual execution environments (e.g. **Bulletin Board Workbench**) with real-time public ledger simulation.
- **Automated 6-Step ZK Showcase**: Visual pipeline demonstrating end-to-end multi-party operations (Genesis -> Alice Post -> Bob Post -> Bob Unauthorized Edit Rejection -> Alice Take Down -> Final State).
- **Identity Switcher**: Toggle simulated identities (Alice vs Bob) to test authorization and witness behavior in real time.

---

### 💼 Wallet Studio & Multi-State Machine Telemetry
- **Multi-Role HD Wallet Management**: Manages keys across `Roles.Zswap` (shielded transactions), `Roles.NightExternal` (public identity / Bech32 address), and `Roles.Dust` (fee balancing).
- **Real-Time Balance Tracking**: Live monitoring of unshielded `tNIGHT` and available `DUST` capacity.
- **One-Click DUST Registration**: Automatically registers UTXOs with the Midnight DUST engine to generate transaction capacity.
- **Unshielded Token Transfer Hub**: Send `tNIGHT` tokens with a 4-step visual execution pipeline (*Balance Check -> UTXO Selection -> Proof Generation -> Broadcast*).
- **Real-Time Sync Activity & Telemetry Monitor**: Sub-wallet convergence tracking across all 3 state machines (Unshielded, Shielded Zswap, DUST Engine) with live throughput rates (items/sec) and event feeds.

---

### 🗄️ Pluggable Dual Persistence (`file` vs `redis-json`)
- **File Storage**: Zero-dependency local JSON file storage (`deployment.json`, `wallet-serialized-state.json`, `tx-history.json`).
- **RedisJSON Driver**: Enterprise Redis Stack persistence with native JSON documents and visual inspection via **RedisInsight Web UI** (`http://localhost:8001`).

---

### 💻 Developer Experience & Web CLI
- **Smart Contract Registry & Explorer**: Centralized catalog of deployed contracts with dynamic routing to individual workbenches.
- **Interactive Web Terminal**: Full-featured in-browser terminal emulator replicating the native CLI tool.
- **Native Node.js CLI & Deployment Scripts**: Terminal utilities (`npm run cli`, `npm run deploy`, `npm run seed`).

---

## 🏗️ Clean Architecture & Hexagonal Design

This project strictly adheres to **Clean Architecture** and **Domain-Driven Design (DDD)** principles, separating business rules from infrastructure and presentation frameworks:

```
                  ┌─────────────────────────────────────────┐
                  │           Presentation Layer            │
                  │   Next.js API Controllers & React UI    │
                  └────────────────────┬────────────────────┘
                                       │ calls
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Application Layer            │
                  │   Use Cases & Data Transfer Objects     │
                  └────────────────────┬────────────────────┘
                                       │ defines / uses
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │              Domain Layer               │
                  │   Pure Entities, Domain Errors & Ports  │
                  └────────────────────▲────────────────────┘
                                       │ implements
                  ┌────────────────────┴────────────────────┐
                  │          Infrastructure Layer           │
                  │  Midnight Adapters, Persistence, DI     │
                  └─────────────────────────────────────────┘
```

### 1. Domain Layer (`src/domain/`)
- **Entities (`src/domain/entities/`)**: Framework-independent enterprise domain models (`contract.entity.ts`, `wallet.entity.ts`, `bulletin-board.entity.ts`, `system.entity.ts`).
- **Ports / Gateways (`src/domain/ports/`)**: Contract interfaces defining abstract operations (`IContractGateway`, `IWalletGateway`, `IBulletinBoardGateway`, `ISystemGateway`, `IDeploymentStorage`).
- **Errors (`src/domain/errors/`)**: Strongly-typed business domain exceptions (`WalletNotSyncedError`, `InsufficientDustError`).

### 2. Application Layer (`src/application/`)
- **Use Cases (`src/application/use-cases/`)**: Application business rule orchestrators:
  - `StoreMessageUseCase`, `DeployContractUseCase`, `GetContractStateUseCase`
  - `GetWalletStatusUseCase`, `RegisterDustUseCase`, `SendUnshieldedTNightUseCase`
  - `GetBulletinBoardStateUseCase`, `ResetBulletinBoardStateUseCase`, `RunBulletinBoardShowcaseUseCase`, `ExecuteBulletinBoardCircuitUseCase`
- **DTOs (`src/application/dto/`)**: Strongly-typed request/response boundary contracts decoupling HTTP inputs from internal domain structures.

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Midnight Adapters (`src/infrastructure/midnight/`)**: Concrete implementations of domain ports interacting with `@midnight-ntwrk/wallet`, `@midnight-ntwrk/midnight-js-contracts`, and `@midnight-ntwrk/compact-runtime` (`MidnightWalletAdapter`, `MidnightContractAdapter`, `MidnightBulletinBoardAdapter`, `MidnightSystemAdapter`).
- **Persistence Drivers (`src/infrastructure/persistence/`)**: Pluggable storage adapters supporting both local JSON file storage and Redis Stack (`redis-json`).
- **Composition Root / DI (`src/infrastructure/di/container.ts`)**: Single dependency injection container assembling gateways, adapters, and use cases into singletons.

### 4. Presentation & API Layer (`app/api/`, `components/`, `src/presentation/`)
- **Thin API Controllers**: Next.js App Router route handlers (`app/api/**/route.ts`) act purely as HTTP transport adapters, parsing requests, delegating to application use cases resolved from `container`, and formatting JSON responses.
- **UI Workbenches & Components**: Rich React components utilizing domain entities, Monaco editor, and context providers.

---

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── ai/compact/route.ts                    # Gemini 3.7 Flash AI Copilot streaming endpoint
│   │   ├── compiler/
│   │   │   ├── compile/route.ts                   # In-browser Compact compiler & ZK artifact builder
│   │   │   ├── files/route.ts                     # Workspace .compact file reader
│   │   │   ├── save/route.ts                      # Workspace .compact file persistence
│   │   │   ├── test/route.ts                      # In-memory Vitest circuit test execution API
│   │   │   └── verify/route.ts                    # Symbolic Formal Verification (SMT/Z3) engine
│   │   ├── contract/
│   │   │   ├── state/route.ts                     # Query on-chain message state
│   │   │   ├── message/route.ts                   # Submit ZK storeMessage transaction
│   │   │   ├── deploy/route.ts                    # Deploy new contract
│   │   │   └── bulletin-board/
│   │   │       ├── showcase/route.ts              # Bulletin Board automated showcase controller
│   │   │       ├── circuit/route.ts               # Manual circuit execution controller
│   │   │       ├── reset/route.ts                 # Bulletin Board simulation reset controller
│   │   │       └── state/route.ts                 # Bulletin Board ledger state controller
│   │   ├── contracts/route.ts                     # Smart contract registry listing API
│   │   ├── wallet/
│   │   │   ├── status/route.ts                    # Stream address & balances
│   │   │   ├── register-dust/route.ts             # Register UTXOs for DUST
│   │   │   └── send/route.ts                      # Send unshielded tNIGHT tokens
│   │   └── system/status/route.ts                 # Check Proof Server & Indexer health
│   ├── contracts/                                 # Smart contract registry & dynamic workbench routes
│   │   ├── page.tsx                               # Smart Contract Registry catalog
│   │   └── [address]/page.tsx                     # Dynamic contract execution workbench router
│   ├── ide/page.tsx                               # Compact Web Studio & in-browser IDE with Monaco
│   ├── globals.css                                # Dark Cyber/Midnight theme & glassmorphism styles
│   ├── layout.tsx                                 # Root layout with fonts and metadata
│   └── page.tsx                                   # Main interactive dashboard page
├── components/
│   ├── AiCopilotPanel.tsx                         # Gemini 3.7 Flash interactive Copilot & quick actions
│   ├── FormalVerificationPanel.tsx                # Formal Verification (SMT / Z3) analyzer panel
│   ├── BulletinBoardWorkbench.tsx                 # Interactive Bulletin Board ZK circuit workbench
│   ├── Header.tsx                                 # Navigation, network badges & health monitor
│   ├── MessageBoard.tsx                           # On-chain message hero display & address switcher
│   ├── MessagePublisher.tsx                       # Zero-Knowledge transaction visualizer & form
│   ├── WalletStudio.tsx                           # HD wallet seed manager & balance studio
│   ├── SyncDashboardModal.tsx                     # Real-time multi-state machine sync monitor & telemetry modal
│   ├── ContractManager.tsx                        # Contract deployment studio
│   ├── WebTerminal.tsx                            # Interactive web CLI console emulator
│   ├── TransactionFeed.tsx                        # Live session transaction history
│   └── Breadcrumbs.tsx                            # Navigation breadcrumbs
├── contracts/
│   ├── hello-world.compact                        # Compact smart contract source code
│   ├── bulletin-board.compact                     # Privacy-preserving Bulletin Board Compact contract
│   └── managed/                                   # Compiled ZK circuits, keys, and JS runtime artifacts
│       ├── hello-world/                           # Hello world managed artifacts
│       └── bulletin-board/                        # Bulletin board managed artifacts
├── src/
│   ├── domain/                                    # Enterprise domain models, errors & port interfaces
│   │   ├── entities/                              # Contract, Wallet, BulletinBoard, System entities
│   │   ├── errors/                                # WalletNotSyncedError, InsufficientDustError
│   │   └── ports/                                 # IWalletGateway, IContractGateway, IBulletinBoardGateway
│   ├── application/                               # Use Cases / Application Business Rules
│   │   ├── dto/                                   # Use case input/output contracts
│   │   └── use-cases/                             # GetBulletinBoardState, RunShowcase, StoreMessage, etc.
│   ├── infrastructure/                            # Midnight SDK adapters, drivers & composition root
│   │   ├── config/                                # Preprod endpoints, network & storage config
│   │   ├── ide/                                   # Monarch tokenizer & Compact starter templates
│   │   ├── midnight/                              # Midnight SDK & Simulation adapters
│   │   ├── persistence/                           # Dual persistence drivers (File & Redis Stack)
│   │   └── di/container.ts                        # Dependency injection container & composition root
│   ├── client/                                    # Generated Midnight TypeScript Client SDKs
│   │   ├── hello-world-sdk.ts
│   │   └── bulletin-board-sdk.ts
│   ├── lib/                                       # Shared persistence helpers
│   ├── cli.ts                                     # Terminal interactive CLI script
│   ├── deploy.ts                                  # Terminal contract deployment script
│   └── seed.ts                                    # Offline wallet seed & key derivation tool
├── tests/
│   ├── contracts/                                 # Low-level Compact circuit unit tests
│   └── application/                               # Clean Architecture Use Case unit tests
├── deployment.json                                # Active contract address & seed metadata
├── docker-compose.yml                             # Midnight Proof Server container configuration
└── tsconfig.json                                  # TypeScript configuration
```

---

## 🗄️ Persistence Infrastructure (`file` vs `redis-json`)

The application supports dual persistence architectures, allowing seamless switching between local file storage and an enterprise Redis Stack (`redis-json`) database.

### Storage Drivers Comparison

| Feature | `file` (Default) | `redis-json` (Redis Stack) |
| :--- | :--- | :--- |
| **Backend** | Local `.json` files on disk | Native JSON documents in Redis Stack |
| **Prerequisites** | None | Docker container (`npm run redis:start`) |
| **Contract Deployment** | `deployment.json` | Key: `midnight:deployment` |
| **Wallet Checkpoints** | `wallet-serialized-state.json` | Key: `midnight:wallet:state:<walletId>` |
| **Transaction Feed** | `tx-history.json` | Key: `midnight:tx-history` |
| **Visual Dashboard** | Code editor | RedisInsight Web UI (`http://localhost:8001`) |

---

### Configuration Options

Settings are managed via [`src/infrastructure/config/storage.config.ts`](file:///home/paul/compact/midnight-compact-studio/src/infrastructure/config/storage.config.ts) and can be overridden via environment variables or `.env.local`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `STORAGE_DRIVER` | `file` | Active driver: `file` or `redis-json` |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis Stack connection URL |
| `REDIS_PASSWORD` | *(empty)* | Optional Redis password |
| `REDIS_KEY_PREFIX` | `midnight:` | Namespace prefix for Redis JSON keys |
| `GEMINI_API_KEY` | *(empty)* | Google AI Studio API Key for AI Copilot |

---

### Using RedisJSON

1. **Start Redis Stack & RedisInsight**:
   ```bash
   npm run redis:start
   ```

2. **Migrate existing local JSON files to Redis**:
   ```bash
   npm run migrate:redis
   ```

3. **Start the application with RedisJSON**:
   ```bash
   # Via environment variable
   STORAGE_DRIVER=redis-json npm run dev

   # Or add to .env.local:
   # STORAGE_DRIVER=redis-json
   ```

4. **Inspect your live data visually**:
   Open **RedisInsight UI** at [**http://localhost:8001**](http://localhost:8001) to explore and query your JSON documents in real-time.

5. **Stop Redis Stack**:
   ```bash
   npm run redis:stop
   ```

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm test` | Runs local in-memory Zero-Knowledge circuit unit tests with Vitest |
| `npm run test:watch` | Runs circuit unit tests in live-reload watch mode during development |
| `npm run next:build` | Creates an optimized production build of the Next.js app |
| `npm run start` | Runs the Next.js production server |
| `npm run cli` | Runs the interactive Node.js terminal CLI |
| `npm run deploy` | Deploys a new contract to Midnight Preprod from terminal |
| `npm run compile` | Compiles `contracts/hello-world.compact` using Compact compiler |
| `npm run proof-server:start` | Starts the Docker container for Midnight Proof Server |
| `npm run proof-server:stop` | Stops the Proof Server container |
| `npm run redis:start` | Starts the Redis Stack (JSON & RedisInsight) container |
| `npm run redis:stop` | Stops the Redis Stack container |
| `npm run migrate:redis` | Migrates all file-based deployments, wallet states, and tx history to RedisJSON |

---

## 🏛️ Smart Contract Registry & Lifecycle Management

Understanding how smart contracts are stored, tracked, and managed across the Studio application and the Midnight blockchain:

### What happens if a user deletes a contract in the registry?

Deleting a contract depends entirely on **which layer** is being modified:

#### 1. In the Local Studio Registry (`deployment.json` / Redis)
- **UI Visibility**: The contract instance is removed from your active deployments list, recent activity tables, and quick contract switchers in the dashboard.
- **Local Private State**: Your local encrypted private state (e.g. stored witness secrets, local transcript keys) for that instance will no longer be tracked by default.
- **Recoverability**: **Yes.** You can re-import the contract anytime via **"Import Contract"** using its on-chain contract address and blueprint type.

#### 2. On the Midnight Blockchain (Preprod / Mainnet)
- 🔒 **Immutable On-Chain Existence**: Smart contracts deployed to the Midnight blockchain **cannot be deleted, altered, or destroyed**.
- **State Preserved**: The on-chain public ledger state (e.g. posted bulletin board messages, sequence numbers, owner commitments) and historical block transactions remain permanently on the network.
- **Still Interactive**: Anyone (including you, if re-imported) can continue querying its state via the Midnight indexer or submitting ZK transactions to its circuits.

#### 3. In the Blueprint Registry (`contracts/managed/<name>`)
- **Prover Keys Removed**: The ZK proving keys (`zkir`, `keys/`, and `contract/index.js`) are deleted from your disk.
- **Interaction Blocked**: You will not be able to generate zero-knowledge proofs or invoke circuits for that contract type until you recompile the `.compact` file in the IDE or via `npm run compile`.

### Summary Comparison Table

| What is Deleted | Local Studio UI | Local ZK Prover | Midnight Blockchain | Recoverable? |
| :--- | :---: | :---: | :---: | :---: |
| **Deployment History Record** | ❌ Removed | 🟢 Intact | 🟢 **100% Intact & Active** | ✅ Re-import with Address |
| **Compiled Blueprint (`managed/`)** | ❌ Removed | ❌ Deleted | 🟢 **100% Intact & Active** | ✅ Recompile `.compact` |
| **On-Chain Contract** | N/A | N/A | 🔒 **Cannot be deleted** | N/A (Always on-chain) |

---

## 🔧 Diagnostics & Troubleshooting

For a complete reference of diagnostic commands, curl API examples, LevelDB cache locations, and direct Midnight GraphQL indexer queries, refer to:

👉 **[`troubleshooting-commands.md`](file:///home/paul/compact/midnight-compact-studio/troubleshooting-commands.md)**

Key topics covered:
- **Local Storage & LevelDB**: Inspecting persistent wallet cache and LevelDB artifacts.
- **REST API Endpoints**: Checking wallet status, registering DUST, querying contract state, and triggering ZK proofs via `curl`.
- **Direct GraphQL Queries**: Checking Midnight network epoch info (`currentEpochInfo`) and indexer capabilities.
- **DUST Generation Diagnostics**: Verifying UTXO registration status and time-based DUST accrual.

---

## 🛡️ Architecture & Security

- **Network ID**: `preprod`
- **Indexer GraphQL**: `https://indexer.preprod.midnight.network/api/v4/graphql`
- **Node RPC**: `https://rpc.preprod.midnight.network`
- **Local Proof Server**: `http://127.0.0.1:6300` (Docker container running `midnightntwrk/proof-server:8.1.0`)
- **Key Derivation**: HD Wallet derivation across `Roles.Zswap` (shielded transactions), `Roles.NightExternal` (public identity / Bech32 address), and `Roles.Dust` (fee balancing).
- **Private State Persistence & Dual Storage**:
  - **LevelDB Provider**: Uses `@midnight-ntwrk/midnight-js-level-private-state-provider` with AES-256-GCM encrypted persistence stored in `/midnight-level-db/`.
  - **File Storage Fallback**: Implements a dedicated `FilePrivateStateProvider` (`private-state-store.json`) for seamless persistence across Next.js dev server reloads and multi-worker environments without native LevelDB file-lock conflicts.
  - **Next.js Server External Packages**: Configured via `serverExternalPackages` in `next.config.mjs` to allow native C++ bindings (`classic-level`) and Midnight packages (`@midnight-ntwrk/compact-js`, `@midnight-ntwrk/ledger-v8`) to load directly via Node.js runtime.
- **Local Secret & Data Isolation**:
  - All local state files (`wallet-cache.json`, `tx-history.json`, `private-state-store.json`, `deployment.json`, and `/midnight-level-db/`) are excluded in `.gitignore` to prevent sensitive credentials and private keys from being committed.
