# Midnight Network — Hello World ZK DApp & CLI

A full-stack decentralized Zero-Knowledge application and interactive CLI built on the **Midnight Network (Preprod)** using **Compact** smart contracts and **Next.js**.

---

## 🌟 Features

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
│   │   ├── contract/state/route.ts       # Query on-chain message state
│   │   ├── contract/message/route.ts     # Submit ZK storeMessage transaction
│   │   ├── contract/deploy/route.ts      # Deploy new contract
│   │   ├── wallet/status/route.ts        # Stream address & balances
│   │   ├── wallet/register-dust/route.ts # Register UTXOs for DUST
│   │   ├── wallet/send/route.ts          # Send unshielded tNIGHT tokens
│   │   └── system/status/route.ts        # Check Proof Server & Indexer health
│   ├── globals.css                       # Dark Cyber/Midnight theme & glassmorphism styles
│   ├── layout.tsx                        # Root layout with fonts and metadata
│   └── page.tsx                          # Main interactive dashboard page
├── components/
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

