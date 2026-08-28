import type {
    TransactionExecutionReceipt,
    DeploymentExecutionReceipt,
    ContractMessageSnapshot,
} from '../entities/contract.entity';

export interface IContractGateway {
    storeMessage(seed: string, message: string, contractAddress?: string): Promise<TransactionExecutionReceipt>;
    deployContract(seed: string): Promise<DeploymentExecutionReceipt>;
    getContractState(contractAddress?: string): Promise<ContractMessageSnapshot>;
}
