import type { IContractGateway } from '@/src/domain/ports/i-contract.gateway';
import type { GetContractStateInput, GetContractStateOutput } from '../dto/use-case-dtos';

export class GetContractStateUseCase {
    constructor(private readonly contractGateway: IContractGateway) {}

    async execute(input: GetContractStateInput): Promise<GetContractStateOutput> {
        return this.contractGateway.getContractState(input.contractAddress);
    }
}
