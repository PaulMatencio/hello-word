import type { ContractDeploymentRecord } from '../entities/contract.entity';

export interface IDeploymentStorage {
    getDeployment(): ContractDeploymentRecord | null;
    saveDeployment(record: ContractDeploymentRecord): void;
}
