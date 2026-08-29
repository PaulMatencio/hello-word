'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
    customLabels?: Record<string, string>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customLabels = {} }) => {
    const pathname = usePathname();
    if (pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center space-x-2 text-xs text-slate-400 py-1" aria-label="Breadcrumb">
            <Link
                href="/"
                className="flex items-center space-x-1 hover:text-white transition-colors"
                title="Dashboard Home"
            >
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only">Home</span>
            </Link>

            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;
                const label = customLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

                return (
                    <React.Fragment key={href}>
                        <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
                        {isLast ? (
                            <span className="font-semibold text-slate-200 truncate max-w-xs sm:max-w-sm">
                                {label}
                            </span>
                        ) : (
                            <Link href={href} className="hover:text-white transition-colors">
                                {label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
