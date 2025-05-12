import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo } from 'react';
import { shortenAddress } from '@/lib/utils';

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    // In a real implementation, this would connect to a Solana wallet
    setShowModal(true);
  };

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between">
      {/* Logo Section */}
      <Link href="/" className="flex items-center">
        <span className="whitespace-nowrap text-lg md:text-2xl font-bold">Fun Launch</span>
      </Link>

      {/* Navigation and Actions */}
      <div className="flex items-center gap-4">
        <CreatePoolButton />
        {address ? (
          <Button onClick={() => disconnect()}>{shortenAddress(address)}</Button>
        ) : (
          <Button
            onClick={() => {
              handleConnectWallet();
            }}
          >
            <span className="hidden md:block">Connect Wallet</span>
            <span className="block md:hidden">Connect</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
