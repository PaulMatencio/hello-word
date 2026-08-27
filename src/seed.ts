/*

npn run seed
1) get netwrok form user ( default preprod if omitted)
2) get mnemonic from user (12,15,18,21,24 words)
3) convert mnemonic to seedHex (64 bytes) using scure/bip39
4) derive the unshielded seed hex (from seedHex)  using wallet-sdk
5) derive the  unshielded address (from unshielded seed hex) using wallet-sdk 

Attenion:  Run this script offline from a Linux terminal using nodejs locally.  Never Run it on web terminal
*/

import * as bip39 from '@scure/bip39';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk';
import * as readline from 'readline';
import { toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { deriveUnshieldedAddressFromSeed } from '@/src/lib/midnight-service'




// 1. ask user to enter the mnemonic phrase for the wallet we are generating. or create a new one if not provided 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Wrap readline question in a Promise
const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};

async function main() {
    try {

        // Get network from user 
        let network = await question('Enter network (mainnet, preprod, or preview) [default: preprod]: ');
        if (!network) network = 'preprod';
        //  validate  network value
        if (network !== 'mainnet' && network !== 'preprod' && network !== 'preview') {
            console.error('Error: Invalid network');
            process.exit(1);
        }

        // Get mnemonic from user
        const mnemonic = await question('Enter mnemonic phrase: ');

        // Validate mnemonic
        if (!mnemonic || mnemonic.trim().length === 0) {
            console.error('Error: Mnemonic phrase cannot be empty');
            process.exit(1);
        }

        // Validate mnemonic format (should be 12, 15, 18, 21, or 24 words)
        const words = mnemonic.trim().split(/\s+/);
        const validWordCounts = [12, 15, 18, 21, 24];
        if (!validWordCounts.includes(words.length)) {
            console.error(`Error: Invalid mnemonic word count. Expected ${validWordCounts.join(', ')} words, got ${words.length}`);
            process.exit(1);
        }

        // Convert mnemonic to seed
        const seedBytes: Uint8Array = bip39.mnemonicToSeedSync(mnemonic.trim(), ""); // 64 bytes
        const seedHex = Buffer.from(seedBytes).toString('hex');

        console.log("64-byte Root Seed:", seedHex);

        // Create HD wallet - check for successful result
        const hdResult = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));

        // Check if the result is successful (seedOk variant)
        if (hdResult.type !== 'seedOk') {
            console.error('Error: Failed to create HD wallet from seed');
            process.exit(1);
        }

        // Access the actual HDWallet from the result
        const hd = hdResult.hdWallet;

        // Select account and roles ( unshielded, )
        const accountSelector = hd.selectAccount(0);
        const rolesSelector = accountSelector.selectRoles([Roles.NightExternal]); // Unshielded role

        // Derive keys at index 0 - check for successful result
        const derivationResult = rolesSelector.deriveKeysAt(0);

        // Check if derivation was successful
        if (derivationResult.type !== 'keysDerived') {
            console.error(`Error: Failed to derive keys. Result type: ${derivationResult.type}`);
            process.exit(1);
        }
        // convert keys to hex string - we are using the unshielded key (NightExternal)
        const unshieldedSeedKeyHex = toHex(derivationResult.keys[Roles.NightExternal]);
        console.log("Unshielded Seed Key (hex):", unshieldedSeedKeyHex);

        //  Then derive the network specific unshielded address  

        console.log(`Unshielded Address (Bech32m - ${network}`, deriveUnshieldedAddressFromSeed(unshieldedSeedKeyHex, network))

    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the main function
main().catch(console.error);