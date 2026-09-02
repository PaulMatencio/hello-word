import type { ContractBlueprint } from '@/src/domain/entities/contract-registry.entity';

export const CONTRACT_BLUEPRINTS: Record<string, ContractBlueprint> = {
    'hello-world': {
        id: 'hello-world',
        name: 'Hello World Message Board',
        description: 'A Zero-Knowledge decentralized bulletin board smart contract allowing users to store and disclose messages on-chain.',
        category: 'Messaging',
        version: '1.0.0',
        circuits: [
            {
                name: 'storeMessage',
                displayName: 'Store Message',
                description: 'Computes a Zero-Knowledge circuit proof and updates the on-chain message state.',
                params: [
                    {
                        name: 'message',
                        type: 'string',
                        label: 'Message Content',
                        placeholder: 'Enter a public message (e.g. Hello Midnight Preprod!)',
                        required: true,
                    },
                ],
            },
        ],
        stateFields: [
            {
                name: 'message',
                displayName: 'Current Disclosed Message',
                type: 'string',
                description: 'The latest message text committed to the contract ledger.',
            },
        ],
    },
    'bulletin-board': {
        id: 'bulletin-board',
        name: 'Midnight Bulletin Board',
        description: 'A state-managed Zero-Knowledge bulletin board supporting posting, sequence tracking, and owner-authorized teardown.',
        category: 'Messaging',
        version: '1.0.0',
        circuits: [
            {
                name: 'postMessage',
                displayName: 'Post / Edit Message',
                description: 'Post a new message when VACANT, or update the existing message if you are the current author.',
                params: [
                    {
                        name: 'newMessage',
                        type: 'string',
                        label: 'Message',
                        placeholder: 'Enter message to post or update on the bulletin board...',
                        required: true,
                    },
                ],
            },
            {
                name: 'takeDown',
                displayName: 'Take Down Post',
                description: 'Remove your message from the bulletin board if you are the proven author.',
                params: [],
            },
        ],
        stateFields: [
            {
                name: 'state',
                displayName: 'Board State',
                type: 'string',
                description: 'Current status of the board: VACANT (0) or OCCUPIED (1).',
            },
            {
                name: 'message',
                displayName: 'Active Message',
                type: 'string',
                description: 'The pinned message currently on display.',
            },
            {
                name: 'sequence',
                displayName: 'Sequence Counter',
                type: 'number',
                description: 'Monotonically increasing sequence number for every posted message.',
            },
            {
                name: 'owner',
                displayName: 'Author Commitment',
                type: 'string',
                description: 'Zero-Knowledge public key hash identifying the current post author.',
            },
        ],
    },
};

export type { ContractBlueprint };

export function getContractBlueprint(id: string): ContractBlueprint | null {
    return CONTRACT_BLUEPRINTS[id] || null;
}

export function getAllContractBlueprints(): ContractBlueprint[] {
    return Object.values(CONTRACT_BLUEPRINTS);
}
