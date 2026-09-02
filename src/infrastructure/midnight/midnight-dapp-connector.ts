/**
 * Midnight DApp Connector Adapter
 *
 * Implements client-side detection and connection to Midnight browser wallet extensions
 * (Midnight Lace / Midnight CIP-30 DApp connector) without seed or private key exposure.
 */

export interface MidnightConnectedApi {
    getUnshieldedAddress: () => Promise<string>;
    getShieldedAddress?: () => Promise<string>;
    getBalances?: () => Promise<{ tNight?: bigint; dust?: bigint }>;
    getNetworkId?: () => Promise<string>;
    signTransaction?: (tx: any) => Promise<any>;
    submitTransaction?: (tx: any) => Promise<string>;
}

export interface MidnightDAppConnector {
    name?: string;
    icon?: string;
    apiVersion?: string;
    isEnabled: () => Promise<boolean>;
    enable: () => Promise<MidnightConnectedApi>;
}

export interface ExtensionWalletState {
    isInstalled: boolean;
    isConnected: boolean;
    name: string;
    address: string;
    shieldedAddress?: string;
    networkId?: string;
    tNightBalance?: string;
    dustBalance?: string;
}

/**
 * Checks whether a compatible Midnight browser extension is detected on `window.midnight`.
 */
export function isMidnightExtensionInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    const midnight = (window as any).midnight;
    return Boolean(midnight && (midnight.mnLace || midnight.lace || typeof midnight.enable === 'function'));
}

/**
 * Retrieves the detected Midnight wallet connector descriptor.
 */
export function getMidnightConnector(): MidnightDAppConnector | null {
    if (typeof window === 'undefined') return null;
    const midnight = (window as any).midnight;
    if (!midnight) return null;

    if (midnight.mnLace) return midnight.mnLace;
    if (midnight.lace) return midnight.lace;
    if (typeof midnight.enable === 'function') return midnight;

    return null;
}

/**
 * Connects to the Midnight Lace Extension (prompts user approval in extension without exposing seed).
 */
export async function connectMidnightLaceWallet(): Promise<{
    api: MidnightConnectedApi;
    address: string;
    shieldedAddress?: string;
    networkId?: string;
}> {
    if (!isMidnightExtensionInstalled()) {
        throw new Error('Midnight Lace browser extension is not detected. Please install or enable the extension.');
    }

    const connector = getMidnightConnector();
    if (!connector) {
        throw new Error('No valid Midnight wallet provider found on window.midnight.');
    }

    // Prompts extension connection modal
    const api = await connector.enable();

    let unshieldedAddress = '';
    let shieldedAddress = '';
    let networkId = 'preprod';

    try {
        if (typeof api.getUnshieldedAddress === 'function') {
            unshieldedAddress = await api.getUnshieldedAddress();
        }
        if (typeof api.getShieldedAddress === 'function') {
            shieldedAddress = await api.getShieldedAddress();
        }
        if (typeof api.getNetworkId === 'function') {
            networkId = await api.getNetworkId();
        }
    } catch (err) {
        console.warn('Could not read all extension properties:', err);
    }

    return {
        api,
        address: unshieldedAddress || 'Connected via Midnight Extension',
        shieldedAddress,
        networkId,
    };
}
