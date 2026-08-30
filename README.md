# Midnight Network — Hello World ZK DApp & CLI

A full-stack decentralized Zero-Knowledge application and interactive CLI built on the **Midnight Network (Preprod)** using **Compact** smart contracts and **Next.js**.

---

## 🌟 Features

- **Compact Studio IDE & Test Runner**: In-browser Monaco editor for `.compact` smart contracts with custom Monarch syntax highlighting, error squiggles, starter templates, in-memory circuit unit test runner (`Ctrl+T`), and direct deployment handoff.
- **✨ Gemini 3.7 Flash AI Copilot**: Native AI assistant integrated directly into the Compact Web Studio for automated compiler error diagnosis, Midnight.js client SDK generation, Vitest unit test scaffolding, and Zero-Knowledge privacy & constraint auditing.
- **Local Circuit Unit Test Suite**: Fast in-memory circuit testing (<100ms) with Vitest and built-in assertion & witness verification without network or DUST costs.
- **Decentralized On-Chain Message Board**: Real-time inspection and live polling of public disclosed state from the Midnight Preprod indexer.
- **Zero-Knowledge Message Publisher**: Proves, balances, signs, and broadcasts `storeMessage` circuit transactions with a step-by-step visual pipeline (*Sync -> ZK Proof -> Balance DUST -> Block Confirmation*).
- **Wallet Studio & Send Hub**: Multi-role HD wallet management (`Roles.Zswap`, `Roles.NightExternal`, `Roles.Dust`), live tNIGHT & DUST balance tracking, one-click DUST generation registration, and an unshielded token transfer hub with a 4-step visual execution pipeline.
- **Sync Activity & Telemetry Monitor**: Real-time sub-wallet convergence tracking across all 3 Midnight state machines (Unshielded, Shielded Zswap, DUST Engine), live throughput rates (items/s), and real-time ingestion event feeds.
- **Interactive Web CLI / Terminal**: Embedded terminal emulator replicating the native CLI tool directly inside the browser.
- **Contract Deployment Hub**: One-click deployment of fresh Compact smart contract instances to Midnight Preprod.
- **Native CLI Tools**: Classic terminal interface (`npm run cli`) and deployment script (`npm run deploy`).

---

## 📋 Prerequisites

Before running the application, make sure you have:

1. **Node.js**: `v22.0.0` or higher
2. **Docker & Docker Compose**: Required for running the local Midnight Zero-Knowledge Proof Server
3. **Compact Compiler** *(Optional)*: Only needed if you modify `contracts/hello-world.compact`

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
# Clone the repository and enter the directory
cd hello-word

# Install Node dependencies
npm install
```

### 2. Start the Zero-Knowledge Proof Server

The Midnight proof provider requires the local Proof Server Docker container running on port `6300`:

```bash
# Start Proof Server in the background
npm run proof-server:start

# Verify container is running and healthy
docker ps
```

To stop the proof server later:
```bash
npm run proof-server:stop
```

### 3. (Optional) Compile the Compact Smart Contract

The compiled artifacts are already included under `contracts/managed/hello-world/`. If you modify the contract:

```bash
npm run compile
```

### 4. Run the Next.js Web Application

Start the development server:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💧 Getting Test Tokens (Preprod Faucet)

> [!IMPORTANT]
> The active, working faucet for Midnight Preprod is the **Nethermind Preprod Faucet**:
> 👉 **[https://midnight-tmnight-preprod.nethermind.dev/](https://midnight-tmnight-preprod.nethermind.dev/)**

### Steps to Fund Your Wallet & Generate DUST:

1. In the Web UI (or CLI), copy your **Unshielded Bech32 Address** (e.g. `mn_addr_preprod1...`).
2. Visit the [Nethermind Faucet](https://midnight-tmnight-preprod.nethermind.dev/), paste your address, and request **tNIGHT** tokens.
3. Once received (refresh your balance in Wallet Studio), click **"Register for DUST"**.
4. The wallet will register your unshielded UTXOs to start accruing **DUST** tokens (gas for ZK transactions).

---

## 💻 Using the Web Application

### Interactive Studio
- **Message Board**: Shows the latest message stored on-chain. Click **Refresh** to query the Midnight GraphQL indexer.
- **Prove & Store Message**: Type a message and submit. The app automatically computes a Zero-Knowledge proof with your local proof server, balances the fee with DUST, and broadcasts to Midnight Preprod.
- **Wallet Studio**: View and switch wallet seeds, inspect your Bech32 address, check live tNIGHT / DUST balances, and register for DUST.
- **Send Unshielded tNIGHT**: Click **"Send"** in Wallet Studio to open the interactive Send Modal. Transfer tNIGHT to any Bech32m unshielded recipient with a live 4-stage execution stepper (*Prepare Recipe -> Keystore Sign -> ZK Prove & Finalize -> Network Broadcast*) and a complete receipt showing transaction hash, settlement time, and DUST gas cost.
- **Sync Telemetry Monitor**: Click the sync indicator or monitor button to open the live dashboard tracking multi-state machine convergence (Unshielded, Shielded, DUST), indexing throughput, and real-time event feeds.
- **Contract Manager**: Deploy a new instance of the contract or switch active contract addresses.

### Compact Studio & Gemini 3.7 Flash AI Copilot (`/ide`)
The in-browser IDE Studio features an integrated **Gemini 3.7 Flash** AI Copilot designed specifically for Zero-Knowledge smart contract development:
1. **AI Streaming Backend Endpoint (`/api/ai/compact`)**:
   - Powered by the official `@google/genai` SDK with model `gemini-3.7-flash`.
   - Conditioned with deep Midnight domain knowledge: Compact type system, witness 2-tuple return conventions (`[PS, Value]`), ZK assertion constraints, and `@midnight-ntwrk/midnight-js-contracts` client patterns.
   - Streams responses in real-time via `ReadableStream`.
2. **Interactive AI Copilot Panel (`AiCopilotPanel`)**:
   - **🛠️ Fix Compiler Error**: Consumes compiler stdout, stderr, and line diagnostics to immediately diagnose syntax or type errors and generate working fixes with automatic recompilation.
   - **⚡ Generate Client SDK & Documentation**: Scaffolds both comprehensive Markdown SDK documentation (architecture, ledger schema, witness/privacy rules, circuit reference, quickstart walkthrough) and a production-grade, strongly typed TypeScript client adapter.
   - **🧪 Generate Vitest Tests**: Auto-generates unit test suites with simulated constructor/circuit contexts and mock witness handlers.
   - **🔒 Audit ZK & Privacy**: Scans circuits for private witness leakage, unconstrained variables, and state transition flaws.
   - **1-Click "Apply to Editor"**: Directly inserts generated Compact contract code into Monaco Editor and auto-recompiles.
   - **Save & Download**: Save generated TypeScript clients (`src/client/`), unit tests (`tests/contracts/`), and Markdown documentation (`docs/`) directly into your project workspace.
   - **Flexible API Keys**: Uses `GEMINI_API_KEY` from `.env.local` or allows entering a key directly in the UI settings drawer (stored in browser `localStorage`).
3. **Seamless IDE Studio Integration**:
   - Dedicated **"✨ AI Copilot"** tab in the Studio inspector panel.
   - Contextual **"Fix with Gemini 3.7 Flash"** shortcut buttons inside the **Console** tab when compilation errors occur.

### Web CLI Mode
Click the **"Web CLI"** tab in the top navigation bar to open the built-in terminal emulator. Available commands:
- `help` — Show available commands
- `store <message>` or `1` — Store a new message to the contract
- `read` or `2` — Read current message from the blockchain
- `status` or `3` — Check wallet address, tNIGHT balance, and DUST balance
- `dust` or `4` — Register UTXOs for DUST generation
- `deploy` or `5` — Deploy a new contract
- `clear` — Clear the terminal screen

---

## 🖥️ Running the Terminal CLI

You can also interact with your contract directly from your shell without the browser:

```bash
# Run the interactive CLI
npm run cli

# Deploy a new contract from the terminal
npm run deploy
```

---

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── ai/compact/route.ts           # Gemini 3.7 Flash AI Copilot streaming endpoint
│   │   ├── compiler/compile/route.ts     # In-browser Compact compiler & ZK artifact builder
│   │   ├── compiler/test/route.ts        # In-memory Vitest circuit test execution API
│   │   ├── contract/state/route.ts       # Query on-chain message state
│   │   ├── contract/message/route.ts     # Submit ZK storeMessage transaction
│   │   ├── contract/deploy/route.ts      # Deploy new contract
│   │   ├── wallet/status/route.ts        # Stream address & balances
│   │   ├── wallet/register-dust/route.ts # Register UTXOs for DUST
│   │   ├── wallet/send/route.ts          # Send unshielded tNIGHT tokens
│   │   └── system/status/route.ts        # Check Proof Server & Indexer health
│   ├── globals.css                       # Dark Cyber/Midnight theme & glassmorphism styles
│   ├── layout.tsx                        # Root layout with fonts and metadata
│   ├── ide/page.tsx                      # Compact Web Studio & in-browser IDE with Monaco
│   └── page.tsx                          # Main interactive dashboard page
├── components/
│   ├── AiCopilotPanel.tsx                # Gemini 3.7 Flash interactive Copilot & quick actions
│   ├── Header.tsx                        # Navigation, network badges & health monitor
│   ├── MessageBoard.tsx                  # On-chain message hero display & address switcher
│   ├── MessagePublisher.tsx              # Zero-Knowledge transaction visualizer & form
│   ├── WalletStudio.tsx                  # HD wallet seed manager & balance studio
│   ├── SyncDashboardModal.tsx            # Real-time multi-state machine sync monitor & telemetry modal
│   ├── ContractManager.tsx               # Contract deployment studio
│   ├── WebTerminal.tsx                   # Interactive web CLI console emulator
│   └── TransactionFeed.tsx               # Live session transaction history
├── contracts/
│   ├── hello-world.compact               # Compact smart contract source code
│   └── managed/hello-world/              # Compiled ZK circuits, keys, and JS runtime
├── src/
│   ├── domain/                           # Enterprise domain models, errors & port interfaces
│   │   ├── entities/                     # WalletSnapshot, ContractDeployment, TxReceipt
│   │   ├── errors/                       # WalletNotSyncedError, InsufficientDustError
│   │   └── ports/                        # IWalletGateway, IContractGateway, ISystemGateway
│   ├── application/                      # Use Cases / Application Business Rules
│   │   ├── dto/                          # Use case input/output contracts
│   │   └── use-cases/                    # StoreMessage, DeployContract, SendTNight, RegisterDust
│   ├── infrastructure/                   # Midnight SDK adapters, drivers & composition root
│   │   ├── config/                       # Preprod endpoints, network & storage config
│   │   │   ├── midnight.config.ts        # RPC, Indexer, and Proof Server URLs
│   │   │   └── storage.config.ts         # Active storage driver (file vs redis-json)
│   │   ├── midnight/                     # Wallet & Contract Midnight SDK adapters
│   │   ├── persistence/                  # Dual persistence drivers (File & Redis Stack)
│   │   │   ├── file-deployment.storage.ts
│   │   │   ├── file-wallet-state.storage.ts
│   │   │   ├── storage.factory.ts        # Storage service resolver factory
│   │   │   └── redis/                    # Redis Stack (RedisJSON) adapters
│   │   │       ├── redis-client.factory.ts
│   │   │       ├── redis-deployment.storage.ts
│   │   │       ├── redis-wallet-state.storage.ts
│   │   │       └── redis-tx-history.storage.ts
│   │   └── di/container.ts               # Dependency injection container & composition root
│   ├── lib/
│   │   ├── midnight-service.ts           # Backward-compatible service facade
│   │   ├── file-private-state-provider.ts # File-based private state persistence
│   │   └── file-transaction-history-storage.ts # File-based tx feed persistence
│   ├── cli.ts                            # Terminal interactive CLI script
│   ├── deploy.ts                         # Terminal contract deployment script
│   ├── seed.ts                           # Offline wallet seed & key derivation tool
│   └── migrate-to-redis.ts               # Migration tool: File storage -> RedisJSON
├── redis/
│   └── docker-compose.yml                # Redis Stack (RedisJSON & RedisInsight) container
├── deployment.json                       # Active contract address & seed metadata
├── docker-compose.yml                    # Midnight Proof Server container configuration
├── troubleshooting-commands.md           # Comprehensive CLI diagnostics, API & GraphQL query guide
├── next.config.mjs                       # Next.js server & WebAssembly configuration
├── package.json                          # Dependencies and scripts
└── tsconfig.json                         # TypeScript configuration
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

Settings are managed via [`src/infrastructure/config/storage.config.ts`](file:///home/paul/compact/hello-word/src/infrastructure/config/storage.config.ts) and can be overridden via environment variables or `.env.local`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `STORAGE_DRIVER` | `file` | Active driver: `file` or `redis-json` |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis Stack connection URL |
| `REDIS_PASSWORD` | *(empty)* | Optional Redis password |
| `REDIS_KEY_PREFIX` | `midnight:` | Namespace prefix for Redis JSON keys |

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

---

## 🔧 Diagnostics & Troubleshooting

For a complete reference of diagnostic commands, curl API examples, LevelDB cache locations, and direct Midnight GraphQL indexer queries, refer to:

👉 **[`troubleshooting-commands.md`](file:///home/paul/compact/hello-word/troubleshooting-commands.md)**

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

