import type { IBulletinBoardGateway } from '@/src/domain/ports/i-bulletin-board.gateway';
import type { BulletinBoardLedgerState } from '@/src/domain/entities/bulletin-board.entity';
import type { ResetBulletinBoardStateInput } from '../dto/use-case-dtos';

export class ResetBulletinBoardStateUseCase {
    constructor(private readonly gateway: IBulletinBoardGateway) {}

    async execute(input: ResetBulletinBoardStateInput): Promise<BulletinBoardLedgerState> {
        return this.gateway.resetState(input.sessionId);
    }
}
