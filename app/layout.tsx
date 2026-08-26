import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Midnight Network | Hello World ZK DApp',
  description: 'Decentralized Zero-Knowledge application interacting with the Midnight Preprod blockchain and Hello World Compact smart contract.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-mesh min-h-screen text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
