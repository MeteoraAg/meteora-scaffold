import { useWallet } from '@jup-ag/wallet-adapter';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '../ui/Skeleton';

export function TerminalComponent({ mint }: { mint: string }) {
  const walletContext = useWallet();

  const [isLoaded, setIsLoaded] = useState(false);

  const launchTerminal = useCallback(async () => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: 'jupiter-terminal',
      formProps: {
        initialInputMint: 'So11111111111111111111111111111111111111112',
        initialOutputMint: mint,
      },
    });
  }, [mint]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded || !window.Jupiter.init) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter.init));
      }, 500);
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, [isLoaded]);

  useEffect(() => {
    setTimeout(() => {
      if (isLoaded && Boolean(window.Jupiter.init)) {
        launchTerminal();
      }
    }, 200);
  }, [isLoaded, launchTerminal]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.Jupiter.init({
          displayMode: 'integrated',
          integratedTargetId: 'jupiter-terminal',
          formProps: {
            initialInputMint: 'So11111111111111111111111111111111111111112',
            initialOutputMint: mint,
          },
        });
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Jupiter) {
      window.Jupiter.syncProps({ passthroughWalletContextState: walletContext });
    }
  }, [walletContext]);

  return (
    <div className="flex flex-col h-full w-full">
      {!isLoaded ? (
        <div className="w-full h-[395px] ">
          <div className="flex flex-col items-center justify-start w-full h-full gap-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <span className="text-gray-400 mt-4">Loading Jupiter Terminal...</span>
          </div>
        </div>
      ) : (
        <div id="jupiter-terminal" className="w-full h-[568px]" />
      )}
    </div>
  );
}

export default TerminalComponent;
