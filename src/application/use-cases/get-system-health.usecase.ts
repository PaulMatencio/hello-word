import type { ISystemGateway } from '@/src/domain/ports/i-system.gateway';
import type { GetSystemHealthOutput } from '../dto/use-case-dtos';

export class GetSystemHealthUseCase {
    constructor(private readonly systemGateway: ISystemGateway) {}

    async execute(): Promise<GetSystemHealthOutput> {
        return this.systemGateway.getHealthReport();
    }
}
