import type { IBulletinBoardGateway } from '@/src/domain/ports/i-bulletin-board.gateway';
import type { BulletinBoardLedgerState } from '@/src/domain/entities/bulletin-board.entity';
import type { GetBulletinBoardStateInput } from '../dto/use-case-dtos';

export class GetBulletinBoardStateUseCase {
    constructor(private readonly gateway: IBulletinBoardGateway) {}

    async execute(input: GetBulletinBoardStateInput): Promise<BulletinBoardLedgerState> {
        return this.gateway.getLiveState(input.sessionId);
    }
}
