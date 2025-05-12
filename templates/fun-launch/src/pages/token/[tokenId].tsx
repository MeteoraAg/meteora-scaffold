import { TokenPageMsgHandler } from '@/components/Token/TokenPageMsgHandler';
import { TokenChart } from '@/components/TokenChart/TokenChart';
import { TokenDetails } from '@/components/TokenHeader/TokenDetail';
import { TokenHeader } from '@/components/TokenHeader/TokenHeader';
import { TokenStats } from '@/components/TokenHeader/TokenStats';
import { TxnsTab } from '@/components/TokenTransactions';
import { TxTable } from '@/components/TokenTransactions/TxTable';
import Page from '@/components/ui/Page/Page';
import { DataStreamProvider, useDataStream } from '@/contexts/DataStreamProvider';
import { TokenChartProvider } from '@/contexts/TokenChartProvider';
import { useTokenAddress, useTokenInfo } from '@/hooks/queries';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

const SwapWidget = () => {
  const tokenId = useTokenAddress();
  return <Terminal mint={tokenId} />;
};

export const TokenPageWithContext = () => {
  const tokenId = useTokenAddress();
  const { data: poolId } = useTokenInfo((data) => data?.id);
  const { subscribeTxns, unsubscribeTxns, subscribePools, unsubscribePools } = useDataStream();

  // Subscribe to token txns
  useEffect(() => {
    if (!tokenId) {
      return;
    }
    subscribeTxns([tokenId]);
    return () => {
      unsubscribeTxns([tokenId]);
    };
  }, [tokenId, subscribeTxns, unsubscribeTxns]);

  useEffect(() => {
    if (!poolId) {
      return;
    }

    subscribePools([poolId]);
    return () => {
      unsubscribePools([poolId]);
    };
    // dont track tokenId to prevent data mismatch
  }, [poolId, subscribePools, unsubscribePools]);

  return (
    <Page>
      <TokenPageMsgHandler />

      <div className="max-h-screen">
        <div className="flex mb-4 rounded-lg border border-neutral-700 p-3">
          <TokenHeader className="max-sm:order-1" />
        </div>

        <div className="w-full h-full flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4 mb-8 max-sm:w-full lg:min-w-[400px] max-sm:order-3">
            <TokenDetails />
            <div>
              <SwapWidget />
            </div>
          </div>

          <div className={'border-neutral-850 w-full max-sm:order-2'}>
            <TokenStats key={`token-stats-${poolId}`} />

            <div className="flex flex-col h-[300px] lg:h-[500px] w-full">
              <TokenChartProvider>
                <TokenChart />
              </TokenChartProvider>
            </div>

            {/* Height 0 makes the element not contribute to height sizing */}
            {/* Min height 100% makes the element fill height */}
            <div className="flex flex-1 flex-col overflow-hidden mt-4 h-[300px] lg:h-[500px] max-sm:order-4">
              <TxnsTab />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default function TokenPage() {
  return (
    <DataStreamProvider>
      <TokenPageWithContext />
    </DataStreamProvider>
  );
}
