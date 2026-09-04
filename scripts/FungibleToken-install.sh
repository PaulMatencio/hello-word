# Save as scripts/FungibleToken-install.sh
#!/usr/bin/env bash
set -euo pipefail

echo "Installing Midnight Compact Runtime and TypeScript dependencies..."
npm install --save \
  @midnight-ntwrk/compact-runtime@^0.7.0 \
  @midnight-ntwrk/compact-js@^0.7.0

npm install --save-dev \
  typescript@^5.5.0 \
  tsx@^4.19.0 \
  @types/node@^20.0.0

echo "Dependencies successfully installed."