# Midnight Network — Hello World ZK DApp & CLI

A full-stack decentralized Zero-Knowledge application and interactive CLI built on the **Midnight Network (Preprod)** using **Compact** smart contracts and **Next.js**.

---

## 🌟 Features

- **Decentralized On-Chain Message Board**: Real-time inspection and live polling of public disclosed state from the Midnight Preprod indexer.
- **Zero-Knowledge Message Publisher**: Proves, balances, signs, and broadcasts `storeMessage` circuit transactions with a step-by-step visual pipeline (*Sync -> ZK Proof -> Balance DUST -> Block Confirmation*).
- **Wallet Studio**: Multi-role HD wallet management (`Roles.Zswap`, `Roles.NightExternal`, `Roles.Dust`), live tNIGHT & DUST balance tracking, and one-click DUST generation registration.
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
│   ├── lib/midnight-service.ts           # Central Midnight SDK & wallet service layer
│   ├── cli.ts                            # Terminal interactive CLI script
│   └── deploy.ts                         # Terminal contract deployment script
├── deployment.json                       # Active contract address & seed metadata
├── docker-compose.yml                    # Midnight Proof Server container configuration
├── next.config.mjs                       # Next.js server & WebAssembly configuration
├── package.json                          # Dependencies and scripts
└── tsconfig.json                         # TypeScript configuration
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

---

## 🛡️ Architecture & Security

- **Network ID**: `preprod`
- **Indexer GraphQL**: `https://indexer.preprod.midnight.network/api/v4/graphql`
- **Node RPC**: `https://rpc.preprod.midnight.network`
- **Local Proof Server**: `http://127.0.0.1:6300` (Docker container running `midnightntwrk/proof-server:8.1.0`)
- **Key Derivation**: HD Wallet derivation across `Roles.Zswap` (shielded transactions), `Roles.NightExternal` (public identity / Bech32 address), and `Roles.Dust` (fee balancing).
