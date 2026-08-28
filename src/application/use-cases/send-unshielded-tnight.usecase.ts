import type { IWalletGateway } from '@/src/domain/ports/i-wallet.gateway';
import type { SendUnshieldedTNightInput, SendUnshieldedTNightOutput } from '../dto/use-case-dtos';

export class SendUnshieldedTNightUseCase {
    constructor(private readonly walletGateway: IWalletGateway) {}

    async execute(input: SendUnshieldedTNightInput): Promise<SendUnshieldedTNightOutput> {
        return this.walletGateway.sendUnshieldedTransfer(input.seed, input.receiver, input.amount);
    }
}
