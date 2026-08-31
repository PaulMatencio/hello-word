'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BulletinBoardWorkbench } from '@/components/BulletinBoardWorkbench';

export default function BulletinBoardWorkbenchPage() {
    return (
        <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col gap-3">
                <Breadcrumbs
                    customLabels={{
                        contracts: 'Contracts',
                        'bulletin-board': 'Bulletin Board Workbench',
                    }}
                />

                <div className="flex items-center justify-between">
                    <Link
                        href="/contracts"
                        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Contract Registry</span>
                    </Link>

                    <div className="flex items-center space-x-2">
                        <span className="rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-0.5 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Compact ZK Simulator</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Interactive Workbench Component */}
            <BulletinBoardWorkbench />
        </div>
    );
}
