import type { IContractGateway } from '@/src/domain/ports/i-contract.gateway';
import type { StoreMessageInput, StoreMessageOutput } from '../dto/use-case-dtos';

export class StoreMessageUseCase {
    constructor(private readonly contractGateway: IContractGateway) {}

    async execute(input: StoreMessageInput): Promise<StoreMessageOutput> {
        return this.contractGateway.storeMessage(input.seed, input.message, input.contractAddress);
    }
}
