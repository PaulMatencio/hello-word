/**
 * Composition Root / Dependency Injection Container
 * Assembles domain gateways, adapters, and use cases into singletons for application consumption.
 */

import { FileDeploymentStorage } from '../persistence/file-deployment.storage';
import { FileTransactionHistoryStorage } from '@/src/lib/file-transaction-history-storage';
import { FileWalletStateStorage } from '../persistence/file-wallet-state.storage';
import { MidnightWalletAdapter } from '../midnight/midnight-wallet.adapter';
import { MidnightContractAdapter } from '../midnight/midnight-contract.adapter';
import { MidnightSystemAdapter } from '../midnight/midnight-system.adapter';

import { GetWalletStatusUseCase } from '@/src/application/use-cases/get-wallet-status.usecase';
import { RegisterDustUseCase } from '@/src/application/use-cases/register-dust.usecase';
import { StoreMessageUseCase } from '@/src/application/use-cases/store-message.usecase';
import { DeployContractUseCase } from '@/src/application/use-cases/deploy-contract.usecase';
import { GetContractStateUseCase } from '@/src/application/use-cases/get-contract-state.usecase';
import { SendUnshieldedTNightUseCase } from '@/src/application/use-cases/send-unshielded-tnight.usecase';
import { GetSystemHealthUseCase } from '@/src/application/use-cases/get-system-health.usecase';
import { DeriveKeysUseCase } from '@/src/application/use-cases/derive-keys.usecase';

class Container {
    // Persistence
    public readonly deploymentStorage = new FileDeploymentStorage();
    public readonly txHistoryStorage = new FileTransactionHistoryStorage();
    public readonly walletStateStorage = new FileWalletStateStorage();

    // Adapters / Gateways
    public readonly walletGateway = new MidnightWalletAdapter(this.txHistoryStorage, this.walletStateStorage);
    public readonly contractGateway = new MidnightContractAdapter(this.walletGateway, this.deploymentStorage, this.txHistoryStorage);
    public readonly systemGateway = new MidnightSystemAdapter(this.deploymentStorage);

    // Use Cases
    public readonly getWalletStatusUseCase = new GetWalletStatusUseCase(this.walletGateway);
    public readonly registerDustUseCase = new RegisterDustUseCase(this.walletGateway);
    public readonly storeMessageUseCase = new StoreMessageUseCase(this.contractGateway);
    public readonly deployContractUseCase = new DeployContractUseCase(this.contractGateway);
    public readonly getContractStateUseCase = new GetContractStateUseCase(this.contractGateway);
    public readonly sendUnshieldedTNightUseCase = new SendUnshieldedTNightUseCase(this.walletGateway);
    public readonly getSystemHealthUseCase = new GetSystemHealthUseCase(this.systemGateway);
    public readonly deriveKeysUseCase = new DeriveKeysUseCase(this.walletGateway);
}

// Export singleton instance
export const container = new Container();
