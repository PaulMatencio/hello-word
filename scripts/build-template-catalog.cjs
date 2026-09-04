const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, 'src/infrastructure/data/templates/catalog.json');
const currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const ftCode = fs.readFileSync(path.join(rootDir, 'contracts/FungibleToken.compact'), 'utf8');
const mtCode = fs.readFileSync(path.join(rootDir, 'contracts/MultiToken.compact'), 'utf8');
const ownVaultCode = fs.readFileSync(path.join(rootDir, 'contracts/OwnableVault.compact'), 'utf8');
const pauseTokenCode = fs.readFileSync(path.join(rootDir, 'contracts/PausableToken.compact'), 'utf8');
const shieldedCode = fs.readFileSync(path.join(rootDir, 'contracts/ShieldedERC20.compact'), 'utf8');

const ozOwnableCode = fs.readFileSync(path.join(rootDir, 'contracts/modules/access/Ownable.compact'), 'utf8');
const ozPausableCode = fs.readFileSync(path.join(rootDir, 'contracts/modules/security/Pausable.compact'), 'utf8');
const ozInitCode = fs.readFileSync(path.join(rootDir, 'contracts/modules/security/Initializable.compact'), 'utf8');
const ozIdentityCode = fs.readFileSync(path.join(rootDir, 'contracts/modules/utils/Identity.compact'), 'utf8');
const ozFtCode = fs.readFileSync(path.join(rootDir, 'contracts/modules/token/FungibleToken.compact'), 'utf8');
const ozMtCode = fs.readFileSync(path.join(rootDir, 'contracts/modules/token/MultiToken.compact'), 'utf8');

const kittiesEntry = currentCatalog.find(e => e.id === 'crypto-kitties');

const newCatalog = [
  // 1. STANDALONE DEPLOYABLE CONTRACTS
  {
    id: 'fungible-token',
    name: 'Fungible Token Standard',
    category: 'Tokens',
    templateType: 'contract',
    deployable: true,
    file: 'contracts/FungibleToken.compact',
    description: 'Production-ready unshielded fungible token with mint, burn, transfer, and allowance circuits.',
    dependencies: [],
    code: ftCode
  },
  {
    id: 'multi-token',
    name: 'Multi-Token Standard (ERC-1155)',
    category: 'Tokens',
    templateType: 'contract',
    deployable: true,
    file: 'contracts/MultiToken.compact',
    description: 'Standalone multi-token contract managing heterogeneous token types with witness-derived identities.',
    dependencies: ['modules/token/MultiToken.compact'],
    code: mtCode
  },
  {
    id: 'shielded-erc20',
    name: 'Shielded ERC20 Token',
    category: 'Tokens',
    templateType: 'contract',
    deployable: true,
    file: 'contracts/ShieldedERC20.compact',
    description: 'Privacy-preserving token with shielded balances, transfers, and minting using Midnight Zswap coins.',
    dependencies: ['modules/utils/Utils.compact'],
    code: shieldedCode
  },
  {
    id: 'ownable-vault',
    name: 'Ownable Access Vault',
    category: 'Security',
    templateType: 'contract',
    deployable: true,
    file: 'contracts/OwnableVault.compact',
    description: 'Single-owner access-controlled vault demonstrating OpenZeppelin Ownable pattern with protected circuits.',
    dependencies: ['modules/access/Ownable.compact', 'modules/utils/Identity.compact'],
    code: ownVaultCode
  },
  {
    id: 'pausable-token',
    name: 'Pausable Token (Circuit-Breaker)',
    category: 'Security',
    templateType: 'contract',
    deployable: true,
    file: 'contracts/PausableToken.compact',
    description: 'Emergency stop circuit-breaker pattern combining OpenZeppelin Pausable and Ownable for operational safety.',
    dependencies: ['modules/security/Pausable.compact', 'modules/access/Ownable.compact', 'modules/utils/Identity.compact'],
    code: pauseTokenCode
  },
  {
    id: 'crypto-kitties',
    name: 'Midnight CryptoKitties',
    category: 'Applications',
    templateType: 'contract',
    deployable: true,
    file: 'contracts/CryptoKitties.compact',
    description: 'Full NFT breeding and trait inheritance smart contract with ZK randomness on Midnight.',
    dependencies: ['modules/token/Nft.compact'],
    code: kittiesEntry ? kittiesEntry.code : ''
  },

  // 2. OPENZEPPELIN MODULAR BUILDING BLOCKS (LIBRARIES / MIXINS)
  {
    id: 'oz-ownable-module',
    name: 'Ownable (OZ Module)',
    category: 'Modules / Access',
    templateType: 'module',
    deployable: false,
    file: 'contracts/modules/access/Ownable.compact',
    description: 'OpenZeppelin single-owner access control module. Import with `import "./modules/access/Ownable" prefix Ownable_;`.',
    dependencies: ['modules/security/Initializable.compact', 'modules/utils/Identity.compact'],
    code: ozOwnableCode
  },
  {
    id: 'oz-pausable-module',
    name: 'Pausable (OZ Module)',
    category: 'Modules / Security',
    templateType: 'module',
    deployable: false,
    file: 'contracts/modules/security/Pausable.compact',
    description: 'OpenZeppelin emergency circuit breaker module. Import with `import "./modules/security/Pausable" prefix Pausable_;`.',
    dependencies: [],
    code: ozPausableCode
  },
  {
    id: 'oz-initializable-module',
    name: 'Initializable (OZ Module)',
    category: 'Modules / Security',
    templateType: 'module',
    deployable: false,
    file: 'contracts/modules/security/Initializable.compact',
    description: 'OpenZeppelin one-time initialization guard. Import with `import "./modules/security/Initializable" prefix Initializable_;`.',
    dependencies: [],
    code: ozInitCode
  },
  {
    id: 'oz-identity-module',
    name: 'Identity & Keys (OZ Module)',
    category: 'Modules / Utils',
    templateType: 'module',
    deployable: false,
    file: 'contracts/modules/utils/Identity.compact',
    description: 'Cryptographic domain-separated persistentHash user and admin public key derivations from private witness secrets.',
    dependencies: [],
    code: ozIdentityCode
  },
  {
    id: 'oz-fungible-module',
    name: 'FungibleToken (OZ Module)',
    category: 'Modules / Tokens',
    templateType: 'module',
    deployable: false,
    file: 'contracts/modules/token/FungibleToken.compact',
    description: 'OpenZeppelin unshielded fungible token library module for composable DApp integration.',
    dependencies: ['modules/security/Initializable.compact', 'modules/utils/Identity.compact'],
    code: ozFtCode
  },
  {
    id: 'oz-multi-token-module',
    name: 'MultiToken (OZ Module)',
    category: 'Modules / Tokens',
    templateType: 'module',
    deployable: false,
    file: 'contracts/modules/token/MultiToken.compact',
    description: 'OpenZeppelin ERC-1155 style multi-token library module for composable multi-asset DApp integration.',
    dependencies: ['modules/security/Initializable.compact'],
    code: ozMtCode
  }
];

fs.writeFileSync(catalogPath, JSON.stringify(newCatalog, null, 2), 'utf8');
console.log(`Successfully written ${newCatalog.length} templates into catalog.json!`);
