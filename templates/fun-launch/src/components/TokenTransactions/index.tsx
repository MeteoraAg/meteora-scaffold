import { useTokenAddress, useTokenInfo } from '@/hooks/queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { memo, useEffect, useMemo, useState } from 'react';
import { ApeQueries } from '../Explore/queries';
import { TxTable } from './TxTable';
import { columns } from './columns';
import { Tx } from '../Explore/types';

export const TxnsTab: React.FC = memo(() => {
  const tokenId = useTokenAddress();
  const { data: symbol } = useTokenInfo((data) => data?.baseAsset.symbol);

  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ApeQueries.tokenTxs({ id: tokenId })
  );

  const allRows = useMemo(
    () => (data && data.pages ? data.pages.flatMap((d) => d?.txs ?? []) : []),
    [data]
  );

  // TODO: optimize re-renders, seems like tables re-render unnecessarily while paused
  const [paused, setPaused] = useState<boolean>(false);
  const [pausedPage, setPausedPage] = useState<Tx[]>([]);

  useEffect(() => {
    if (paused) {
      return;
    }
    setPausedPage(data?.pages[0]?.txs ?? []);
  }, [data, paused]);

  const pausedRows = useMemo(() => {
    const fetchedPages =
      data && data.pages.length > 1 ? data.pages.slice(1).flatMap((d) => d?.txs ?? []) : [];
    return [...pausedPage, ...fetchedPages];
  }, [data, pausedPage]);

  return (
    <TxTable
      symbol={symbol}
      data={paused ? pausedRows : allRows}
      columns={columns}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      paused={paused}
      setPaused={setPaused}
    />
  );
});

TxnsTab.displayName = 'TxnsTab';
