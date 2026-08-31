import type { IBulletinBoardGateway } from '@/src/domain/ports/i-bulletin-board.gateway';
import type { BulletinBoardShowcaseResult } from '@/src/domain/entities/bulletin-board.entity';
import type { RunBulletinBoardShowcaseInput } from '../dto/use-case-dtos';

export class RunBulletinBoardShowcaseUseCase {
    constructor(private readonly gateway: IBulletinBoardGateway) {}

    async execute(input: RunBulletinBoardShowcaseInput): Promise<BulletinBoardShowcaseResult> {
        return this.gateway.runShowcases(input.sessionId);
    }
}
