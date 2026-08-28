import type { SystemHealthReport } from '../entities/system.entity';

export interface ISystemGateway {
    getHealthReport(): Promise<SystemHealthReport>;
}
