/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@midnight-ntwrk/wallet-sdk',
    '@midnight-ntwrk/midnight-js-contracts',
    '@midnight-ntwrk/midnight-js-http-client-proof-provider',
    '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
    '@midnight-ntwrk/midnight-js-level-private-state-provider',
    '@midnight-ntwrk/midnight-js-node-zk-config-provider',
    '@midnight-ntwrk/midnight-js-network-id',
    '@midnight-ntwrk/midnight-js-protocol',
    '@midnight-ntwrk/midnight-js-types',
    '@midnight-ntwrk/compact-runtime',
    'ws',
    'level',
    'classic-level'
  ],
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
