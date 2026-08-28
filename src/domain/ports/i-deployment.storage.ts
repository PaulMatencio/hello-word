import type { ContractDeploymentRecord } from '../entities/contract.entity';

export interface IDeploymentStorage {
    getDeployment(): Promise<ContractDeploymentRecord | null> | ContractDeploymentRecord | null;
    saveDeployment(record: ContractDeploymentRecord): Promise<void> | void;
}
