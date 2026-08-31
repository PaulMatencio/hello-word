import type { IBulletinBoardGateway } from '@/src/domain/ports/i-bulletin-board.gateway';
import type { BulletinBoardCircuitExecutionResult } from '@/src/domain/entities/bulletin-board.entity';
import type { ExecuteBulletinBoardCircuitInput } from '../dto/use-case-dtos';

export class ExecuteBulletinBoardCircuitUseCase {
    constructor(private readonly gateway: IBulletinBoardGateway) {}

    async execute(input: ExecuteBulletinBoardCircuitInput): Promise<BulletinBoardCircuitExecutionResult> {
        return this.gateway.executeCircuit({
            sessionId: input.sessionId,
            action: input.action,
            identity: input.identity,
            message: input.message,
            secretKeyHex: input.secretKeyHex,
        });
    }
}
