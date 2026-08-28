/**
 * Domain Entities: System & Diagnostics
 */

import type { ContractDeploymentRecord } from './contract.entity';

export interface ServiceEndpointStatus {
    url: string;
    status: 'online' | 'offline';
    blockHeight?: number | null;
}

export interface SystemHealthReport {
    proofServer: ServiceEndpointStatus;
    indexer: ServiceEndpointStatus;
    network: string;
    deployment: ContractDeploymentRecord | null;
    faucetUrl: string;
}
