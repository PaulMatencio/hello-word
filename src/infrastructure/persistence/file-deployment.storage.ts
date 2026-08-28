import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IDeploymentStorage } from '@/src/domain/ports/i-deployment.storage';
import type { ContractDeploymentRecord } from '@/src/domain/entities/contract.entity';

export class FileDeploymentStorage implements IDeploymentStorage {
    private readonly filePath: string;

    constructor(customPath?: string) {
        this.filePath = customPath || path.resolve(process.cwd(), 'deployment.json');
    }

    getDeployment(): ContractDeploymentRecord | null {
        if (!fs.existsSync(this.filePath)) {
            return null;
        }
        try {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        } catch {
            return null;
        }
    }

    saveDeployment(record: ContractDeploymentRecord): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(record, null, 2), 'utf-8');
        } catch (err) {
            console.error('Failed to save deployment.json:', err);
        }
    }
}
