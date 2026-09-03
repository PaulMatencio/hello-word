/**
 * Midnight DApp Connector Adapter
 *
 * Implements client-side detection and connection to Midnight browser wallet extensions
 * (Midnight Lace / Midnight CIP-30 DApp connector) without seed or private key exposure.
 */

export interface MidnightConnectedApi {
    getUnshieldedAddress: () => Promise<string>;
    getShieldedAddress?: () => Promise<string>;
    getShieldedAddresses?: () => Promise<any>;
    getDustAddress?: () => Promise<string>;
    getBalances?: () => Promise<{ tNight?: bigint; dust?: bigint } | any>;
    getBalance?: () => Promise<bigint | number | string>;
    getUnshieldedBalances?: () => Promise<Record<string, bigint> | bigint | any>;
    getShieldedBalances?: () => Promise<Record<string, bigint> | bigint | any>;
    getDustBalance?: () => Promise<bigint | number | string>;
    getNetworkId?: () => Promise<string | number>;
    state?: () => Promise<any>;
    signTransaction?: (tx: any) => Promise<any>;
    submitTransaction?: (tx: any) => Promise<string>;
}

export interface ExtensionBalances {
    tNightBalance: string;
    tNightDisplay: string;
    dustBalance: string;
    dustDisplay?: string;
    dustCap?: string;
    dustCapDisplay?: string;
    shieldedBalance?: string;
    isSynced: boolean;
}

export interface MidnightDAppConnector {
    name?: string;
    icon?: string;
    apiVersion?: string;
    isEnabled: () => Promise<boolean>;
    enable: (networkOrOptions?: string | { networkId?: string } | any) => Promise<MidnightConnectedApi>;
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
 * Checks whether a compatible Midnight browser extension is detected.
 * Inspects all known Midnight & Lace injection points on `window.midnight` and `window.cardano`.
 */
export function isMidnightExtensionInstalled(): boolean {
    return getMidnightConnector() !== null;
}

/**
 * Retrieves the detected Midnight wallet connector descriptor.
 */
export function getMidnightConnector(): MidnightDAppConnector | null {
    if (typeof window === 'undefined') return null;

    const w = window as any;

    // 1. Standard / UUID Midnight namespace
    if (w.midnight && typeof w.midnight === 'object') {
        // Priority named keys
        const namedKeys = ['mnLace', 'lace', 'midnight-lace', 'lace-midnight', 'laceMidnight'];
        for (const key of namedKeys) {
            if (w.midnight[key]) return w.midnight[key];
        }

        // UUID or arbitrary keys in window.midnight (e.g. 5f1aa508-fb4b-48c9-b118-de0b55bd24bd)
        const allKeys = Object.keys(w.midnight);
        for (const key of allKeys) {
            const provider = w.midnight[key];
            if (provider && (typeof provider === 'object' || typeof provider === 'function')) {
                return provider;
            }
        }

        // Direct window.midnight if it has enable
        if (typeof w.midnight.enable === 'function') {
            return w.midnight;
        }
    }

    // 2. Cardano Lace multi-chain namespace
    if (w.cardano && typeof w.cardano === 'object') {
        if (w.cardano.lace?.midnight) return w.cardano.lace.midnight;
        if (w.cardano.mnLace) return w.cardano.mnLace;
        if (w.cardano.lace) return w.cardano.lace;
    }

    return null;
}

/**
 * Inspects all wallet provider keys currently present in `window` for diagnostics.
 */
export function getDetectedWalletKeys(): { midnightKeys: string[]; cardanoKeys: string[] } {
    if (typeof window === 'undefined') return { midnightKeys: [], cardanoKeys: [] };
    const w = window as any;
    return {
        midnightKeys: w.midnight && typeof w.midnight === 'object' ? Object.keys(w.midnight) : [],
        cardanoKeys: w.cardano && typeof w.cardano === 'object' ? Object.keys(w.cardano) : [],
    };
}

/**
 * Connects to the Midnight Lace Extension (prompts user approval in extension without exposing seed).
 */
export async function connectMidnightLaceWallet(targetNetwork: string = 'preprod'): Promise<{
    api: MidnightConnectedApi;
    address: string;
    shieldedAddress?: string;
    networkId?: string;
    balances: ExtensionBalances;
}> {
    const connector = getMidnightConnector();
    if (!connector) {
        const keys = getDetectedWalletKeys();
        throw new Error(
            `Midnight Lace browser extension was not detected on window.midnight. (Found window.midnight: [${keys.midnightKeys.join(', ')}], window.cardano: [${keys.cardanoKeys.join(', ')}]). If you just installed Lace, please reload this page.`
        );
    }

    // Midnight Lace DApp connector requires the network ID (e.g. 'preprod')
    let api: any;
    if (typeof connector.enable === 'function') {
        try {
            api = await connector.enable(targetNetwork);
        } catch (err: any) {
            if (err?.message && err.message.includes('Invalid network ID')) {
                // Try object parameter form fallback
                api = await (connector as any).enable({ networkId: targetNetwork });
            } else {
                try {
                    // Fallback for providers expecting standard 0 arguments
                    api = await (connector as any).enable();
                } catch {
                    throw err;
                }
            }
        }
    } else if (typeof (connector as any).connect === 'function') {
        api = await (connector as any).connect(targetNetwork);
    } else {
        api = connector;
    }

    console.log('[Midnight Lace Connector] Successfully connected. API:', api);

    function extractAddressString(val: any): string {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            if (typeof val.unshieldedAddress === 'string') return val.unshieldedAddress;
            if (typeof val.address === 'string') return val.address;
            if (typeof val.shieldedAddress === 'string') return val.shieldedAddress;
            if (Array.isArray(val) && val.length > 0) return extractAddressString(val[0]);
            // If it's a Bech32 or stringifiable object
            try {
                if (typeof val.toString === 'function') {
                    const str = val.toString();
                    if (str && str !== '[object Object]') return str;
                }
            } catch {}
        }
        return '';
    }

    let unshieldedAddress = '';
    let shieldedAddress = '';
    let networkId = 'preprod';

    try {
        if (typeof api.getUnshieldedAddress === 'function') {
            const raw = await api.getUnshieldedAddress();
            unshieldedAddress = extractAddressString(raw);
        }
        
        if (!unshieldedAddress && typeof api.state === 'function') {
            const state = await api.state();
            unshieldedAddress = extractAddressString(state?.unshieldedAddress || state?.address);
            shieldedAddress = extractAddressString(state?.shieldedAddress);
        }

        if (!unshieldedAddress && typeof api.getUsedAddresses === 'function') {
            const addrs = await api.getUsedAddresses();
            unshieldedAddress = extractAddressString(addrs);
        }

        if (!unshieldedAddress && typeof api.getChangeAddress === 'function') {
            const chg = await api.getChangeAddress();
            unshieldedAddress = extractAddressString(chg);
        }

        if (!unshieldedAddress && (api.address || api.unshieldedAddress)) {
            unshieldedAddress = extractAddressString(api.unshieldedAddress || api.address);
        }

        if (typeof api.getShieldedAddress === 'function' && !shieldedAddress) {
            const raw = await api.getShieldedAddress();
            shieldedAddress = extractAddressString(raw);
        }

        if (typeof api.getNetworkId === 'function') {
            const net = await api.getNetworkId();
            networkId = typeof net === 'number' ? (net === 0 ? 'testnet' : 'mainnet') : String(net);
        }
    } catch (err) {
        console.warn('[Midnight Lace Connector] Property inspection warning:', err);
    }

    const finalAddress = unshieldedAddress || shieldedAddress || 'Connected via Midnight Lace';
    const balances = await fetchExtensionWalletBalances(api);

    return {
        api,
        address: finalAddress,
        shieldedAddress,
        networkId,
        balances,
    };
}

/**
 * Fetches token balances directly from the connected Midnight browser wallet extension.
 * Supports @midnight-ntwrk/dapp-connector-api v4 granular methods (getUnshieldedBalances, getDustBalance)
 * with robust fallbacks to legacy getBalances() and state().
 */
export async function fetchExtensionWalletBalances(api: any): Promise<ExtensionBalances> {
    let tNightBigInt = 0n;
    let dustBigInt = 0n;
    let shieldedBigInt = 0n;

    if (!api) {
        return {
            tNightBalance: '0',
            tNightDisplay: '0',
            dustBalance: '0',
            isSynced: true,
        };
    }

    // 1. Check getUnshieldedBalances() (@midnight-ntwrk/dapp-connector-api v4+)
    try {
        if (typeof api.getUnshieldedBalances === 'function') {
            const raw = await api.getUnshieldedBalances();
            if (raw !== null && raw !== undefined) {
                if (typeof raw === 'bigint') {
                    tNightBigInt = raw;
                } else if (typeof raw === 'number' || typeof raw === 'string') {
                    tNightBigInt = BigInt(raw);
                } else if (typeof raw === 'object') {
                    const entries = raw instanceof Map ? Array.from(raw.entries()) : Object.entries(raw);
                    for (const [, val] of entries) {
                        if (typeof val === 'bigint') {
                            tNightBigInt += val;
                        } else if (typeof val === 'number' || typeof val === 'string') {
                            try {
                                tNightBigInt += BigInt(val);
                            } catch {}
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.warn('[Midnight Lace Connector] getUnshieldedBalances error:', err);
    }

    let dustCapBigInt: bigint | undefined = undefined;

    // 2. Check getDustBalance() (@midnight-ntwrk/dapp-connector-api v4+)
    try {
        if (typeof api.getDustBalance === 'function') {
            const raw = await api.getDustBalance();
            if (raw !== null && raw !== undefined) {
                if (typeof raw === 'bigint') {
                    dustBigInt = raw;
                } else if (typeof raw === 'number' || typeof raw === 'string') {
                    dustBigInt = BigInt(raw);
                } else if (typeof raw === 'object') {
                    // Midnight Lace standard v4 return: { balance: bigint, cap: bigint }
                    if (raw.balance !== undefined && raw.balance !== null) {
                        dustBigInt = typeof raw.balance === 'bigint' ? raw.balance : BigInt(raw.balance.toString());
                    } else if (raw.dust !== undefined && raw.dust !== null) {
                        dustBigInt = typeof raw.dust === 'bigint' ? raw.dust : BigInt(raw.dust.toString());
                    } else if (raw.value !== undefined && raw.value !== null) {
                        dustBigInt = typeof raw.value === 'bigint' ? raw.value : BigInt(raw.value.toString());
                    } else if (raw.amount !== undefined && raw.amount !== null) {
                        dustBigInt = typeof raw.amount === 'bigint' ? raw.amount : BigInt(raw.amount.toString());
                    }

                    if (raw.cap !== undefined && raw.cap !== null) {
                        dustCapBigInt = typeof raw.cap === 'bigint' ? raw.cap : BigInt(raw.cap.toString());
                    }
                }
            }
        }
    } catch (err) {
        console.warn('[Midnight Lace Connector] getDustBalance error:', err);
    }

    // 3. Check getShieldedBalances()
    try {
        if (typeof api.getShieldedBalances === 'function') {
            const raw = await api.getShieldedBalances();
            if (raw !== null && raw !== undefined) {
                if (typeof raw === 'bigint') {
                    shieldedBigInt = raw;
                } else if (typeof raw === 'object') {
                    const entries = raw instanceof Map ? Array.from(raw.entries()) : Object.entries(raw);
                    for (const [, val] of entries) {
                        if (typeof val === 'bigint') {
                            shieldedBigInt += val;
                        } else if (typeof val === 'number' || typeof val === 'string') {
                            try {
                                shieldedBigInt += BigInt(val);
                            } catch {}
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.warn('[Midnight Lace Connector] getShieldedBalances error:', err);
    }

    // 4. Fallback: getBalances()
    if (tNightBigInt === 0n && typeof api.getBalances === 'function') {
        try {
            const raw = await api.getBalances();
            if (raw) {
                if (raw.tNight !== undefined) tNightBigInt = BigInt(raw.tNight.toString());
                if (raw.unshielded !== undefined) tNightBigInt = BigInt(raw.unshielded.toString());
                if (raw.dust !== undefined && dustBigInt === 0n) dustBigInt = BigInt(raw.dust.toString());
            }
        } catch (err) {
            console.warn('[Midnight Lace Connector] getBalances error:', err);
        }
    }

    // 5. Fallback: state()
    if (typeof api.state === 'function' && (tNightBigInt === 0n || dustBigInt === 0n)) {
        try {
            const state = await api.state();
            if (state) {
                if (tNightBigInt === 0n) {
                    const ub = state.unshielded?.balances || state.balances?.unshielded || state.unshieldedBalance;
                    if (typeof ub === 'bigint') {
                        tNightBigInt = ub;
                    } else if (typeof ub === 'object' && ub !== null) {
                        const entries = ub instanceof Map ? Array.from(ub.entries()) : Object.entries(ub);
                        for (const [, v] of entries) {
                            if (typeof v === 'bigint') tNightBigInt += v;
                            else if (typeof v === 'number' || typeof v === 'string') tNightBigInt += BigInt(v);
                        }
                    }
                }
                if (dustBigInt === 0n) {
                    const db = state.dust?.balance || state.dustBalance;
                    if (typeof db === 'function') {
                        try {
                            dustBigInt = BigInt(db(new Date())?.toString() || '0');
                        } catch {}
                    } else if (db !== undefined && db !== null) {
                        dustBigInt = BigInt(db.toString());
                    }
                }
            }
        } catch (err) {
            console.warn('[Midnight Lace Connector] state error:', err);
        }
    }

    // 6. Fallback: getBalance()
    if (tNightBigInt === 0n && typeof api.getBalance === 'function') {
        try {
            const bal = await api.getBalance();
            if (bal !== null && bal !== undefined) {
                tNightBigInt = typeof bal === 'bigint' ? bal : BigInt(bal.toString());
            }
        } catch (err) {
            console.warn('[Midnight Lace Connector] getBalance error:', err);
        }
    }

    const formattedTNight = (Number(tNightBigInt) / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
    });

    // In Midnight, 1 DUST = 10^15 SPECK. If the balance is in base units (SPECK >= 10^9),
    // convert it to human-readable DUST units (divide by 10^15).
    const dustUnits = dustBigInt >= 1_000_000_000n ? Number(dustBigInt) / 1e15 : Number(dustBigInt);
    const formattedDust = dustUnits.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    });

    const dustCapUnits = dustCapBigInt !== undefined
        ? (dustCapBigInt >= 1_000_000_000n ? Number(dustCapBigInt) / 1e15 : Number(dustCapBigInt))
        : undefined;
    const formattedDustCap = dustCapUnits !== undefined
        ? dustCapUnits.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })
        : undefined;

    return {
        tNightBalance: tNightBigInt.toString(),
        tNightDisplay: formattedTNight,
        dustBalance: dustBigInt.toString(),
        dustDisplay: formattedDust,
        dustCap: dustCapBigInt !== undefined ? dustCapBigInt.toString() : undefined,
        dustCapDisplay: formattedDustCap,
        shieldedBalance: shieldedBigInt.toString(),
        isSynced: true,
    };
}

