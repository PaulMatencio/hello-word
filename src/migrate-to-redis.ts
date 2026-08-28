/**
 * Migration Script: File Storage -> RedisJSON Storage
 * Migrates deployment records, transaction histories, and serialized wallet checkpoints
 * from local JSON files into Redis Stack native JSON documents.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { STORAGE_CONFIG } from './infrastructure/config/storage.config';
import { getRedisClient, closeRedisClient } from './infrastructure/persistence/redis/redis-client.factory';
import { FileDeploymentStorage } from './infrastructure/persistence/file-deployment.storage';
import { RedisDeploymentStorage } from './infrastructure/persistence/redis/redis-deployment.storage';
import { FileWalletStateStorage } from './infrastructure/persistence/file-wallet-state.storage';
import { RedisWalletStateStorage } from './infrastructure/persistence/redis/redis-wallet-state.storage';
import { FileTransactionHistoryStorage } from './lib/file-transaction-history-storage';
import { RedisTransactionHistoryStorage } from './infrastructure/persistence/redis/redis-tx-history.storage';

async function runMigration() {
    console.log('====================================================');
    console.log('  📦 Midnight Storage Migration: File -> RedisJSON  ');
    console.log('====================================================\n');

    console.log(`Connecting to Redis Stack at ${STORAGE_CONFIG.redis.url}...`);
    let redisClient;
    try {
        redisClient = await getRedisClient();
        const ping = await redisClient.ping();
        console.log(`✅ Redis connection established (PING: ${ping})\n`);
    } catch (err: any) {
        console.error('❌ Could not connect to Redis Stack:', err?.message || err);
        console.error('👉 Make sure Redis Stack is running: npm run redis:start');
        process.exit(1);
    }

    const fileDeployment = new FileDeploymentStorage();
    const redisDeployment = new RedisDeploymentStorage();

    const fileWalletState = new FileWalletStateStorage();
    const redisWalletState = new RedisWalletStateStorage();

    const fileTxHistory = new FileTransactionHistoryStorage();
    const redisTxHistory = new RedisTransactionHistoryStorage();

    // 1. Migrate Deployment Record
    console.log('----------------------------------------------------');
    console.log('1️⃣ Migrating Deployment Record (deployment.json)...');
    try {
        const deployment = await fileDeployment.getDeployment();
        if (deployment) {
            await redisDeployment.saveDeployment(deployment);
            const verified = await redisDeployment.getDeployment();
            console.log(`   ✅ Contract Address : ${verified?.contractAddress}`);
            console.log(`   ✅ Network          : ${verified?.network || 'preprod'}`);
            console.log(`   ✅ Deployed At      : ${verified?.deployedAt}`);
        } else {
            console.log('   ℹ️ No deployment.json found or empty.');
        }
    } catch (err: any) {
        console.error('   ❌ Error migrating deployment record:', err?.message || err);
    }

    // 2. Migrate Transaction History
    console.log('\n----------------------------------------------------');
    console.log('2️⃣ Migrating Transaction History (tx-history.json)...');
    try {
        const records = await fileTxHistory.getTxRecords();
        if (records.length > 0) {
            for (const record of records) {
                await redisTxHistory.storeTxRecord(record);
            }
            const verifiedRecords = await redisTxHistory.getTxRecords();
            console.log(`   ✅ Migrated ${verifiedRecords.length} transaction record(s) to RedisJSON.`);
        } else {
            console.log('   ℹ️ No transactions found in tx-history.json.');
        }
    } catch (err: any) {
        console.error('   ❌ Error migrating transaction history:', err?.message || err);
    }

    // 3. Migrate Serialized Wallet State Checkpoints
    console.log('\n----------------------------------------------------');
    console.log('3️⃣ Migrating Serialized Wallet State (wallet-serialized-state.json)...');
    try {
        const walletStatePath = path.resolve(process.cwd(), STORAGE_CONFIG.file.walletStatePath);
        if (fs.existsSync(walletStatePath)) {
            const rawContent = fs.readFileSync(walletStatePath, 'utf-8');
            const allStates = JSON.parse(rawContent);
            const walletIds = Object.keys(allStates);

            if (walletIds.length > 0) {
                let migratedCount = 0;
                for (const walletId of walletIds) {
                    const stateData = allStates[walletId];
                    await redisWalletState.saveState(walletId, stateData);
                    const verified = await redisWalletState.loadState(walletId);
                    if (verified) {
                        migratedCount++;
                        console.log(`   ✅ Wallet: ${walletId}`);
                        console.log(`      - Shielded State: ${stateData.shielded ? `${(stateData.shielded.length / 1024).toFixed(1)} KB` : 'none'}`);
                        console.log(`      - Dust State    : ${stateData.dust ? `${(stateData.dust.length / 1024).toFixed(1)} KB` : 'none'}`);
                        console.log(`      - Updated At    : ${stateData.updatedAt || 'N/A'}`);
                    }
                }
                console.log(`   ✅ Successfully migrated ${migratedCount} wallet state checkpoint(s).`);
            } else {
                console.log('   ℹ️ wallet-serialized-state.json is empty.');
            }
        } else {
            console.log('   ℹ️ No wallet-serialized-state.json found.');
        }
    } catch (err: any) {
        console.error('   ❌ Error migrating wallet state:', err?.message || err);
    }

    console.log('\n====================================================');
    console.log('🎉 Migration Completed Successfully!');
    console.log('====================================================');
    console.log('💡 To switch your application to use RedisJSON:');
    console.log('   STORAGE_DRIVER=redis-json npm run dev');
    console.log('   or set STORAGE_DRIVER=redis-json in .env.local');
    console.log('   View your data at http://localhost:8001 (RedisInsight UI)\n');

    await closeRedisClient();
}

runMigration().catch((err) => {
    console.error('Unexpected migration failure:', err);
    process.exit(1);
});
