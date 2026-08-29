import type { ContractDeploymentRecord } from '../entities/contract.entity';
import type { DeployedContractRecord } from '../entities/contract-registry.entity';

export interface IDeploymentStorage {
    getDeployment(contractAddress?: string): Promise<ContractDeploymentRecord | null> | ContractDeploymentRecord | null;
    getDeployments(): Promise<DeployedContractRecord[]>;
    saveDeployment(record: ContractDeploymentRecord | DeployedContractRecord): Promise<void> | void;
    deleteDeployment(contractAddress: string): Promise<void>;
}
