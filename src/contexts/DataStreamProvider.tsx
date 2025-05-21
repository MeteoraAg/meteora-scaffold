import { ApeQueries, QueryData } from '@/components/Explore/queries';
import { atomMsgWithListeners } from '@/lib/jotai';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { StreamRequest, StreamResponse } from './TokenChart/msg';
import { delay } from '@/lib/utils';

const WS_URL = 'wss://trench-stream.jup.ag/ws';

const RECONNECT_DELAY_MILLIS = 2_500;

const [dataStreamMsgAtom, useDataStreamListener] = atomMsgWithListeners<StreamResponse | null>(
  null
);
export { useDataStreamListener };

type DataStreamContextType = {
  subscribePools: (pools: string[]) => void;
  unsubscribePools: (pools: string[]) => void;
  subscribeRecentTokenList: () => void;
  unsubscribeRecentTokenList: () => void;
  subscribeTxns: (assets: string[]) => void;
  unsubscribeTxns: (assets: string[]) => void;
};

const DataStreamContext = createContext<DataStreamContextType | null>(null);

export const DataStreamProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const partnerConfigs = useMemo(
    () => process.env.NEXT_PUBLIC_POOL_CONFIG_KEY?.split(',') || [],
    []
  );
  const setDataStreamMsg = useSetAtom(dataStreamMsgAtom);

  const ws = useRef<WebSocket | null>(null);
  const shouldReconnect = useRef(true);
  const subRecentTokenList = useRef(false);
  const subPools = useRef<Set<string>>(new Set());
  const subTxnsAssets = useRef<Set<string>>(new Set());

  const subscribeRecentTokenList = useCallback(() => {
    subRecentTokenList.current = true;

    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        createRequest({
          type: 'subscribe:recent',
          filters: {
            partnerConfigs,
          },
        })
      );
    }
  }, []);

  const unsubscribeRecentTokenList = useCallback(() => {
    subRecentTokenList.current = false;

    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(createRequest({ type: 'unsubscribe:recent' }));
    }
  }, []);

  const subscribePools = useCallback((pools: string[]) => {
    for (const pool of pools) {
      subPools.current.add(pool);
    }

    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(createRequest({ type: 'subscribe:pool', pools: pools }));
    }
  }, []);

  const unsubscribePools = useCallback((pools: string[]) => {
    for (const pool of pools) {
      subPools.current.delete(pool);
    }
    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(createRequest({ type: 'unsubscribe:pool', pools: pools }));
    }
  }, []);

  const subscribeTxns = useCallback((assets: string[]) => {
    for (const asset of assets) {
      subTxnsAssets.current.add(asset);
    }
    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(createRequest({ type: 'subscribe:txns', assets: assets }));
    }
  }, []);

  const unsubscribeTxns = useCallback((assets: string[]) => {
    for (const asset of assets) {
      subTxnsAssets.current.delete(asset);
    }
    if (ws?.current?.readyState === WebSocket.OPEN) {
      ws.current.send(createRequest({ type: 'unsubscribe:txns', assets: assets }));
    }
  }, []);

  // const subscribePrices = useCallback((assets: string[]) => {
  //   for (const asset of assets) {
  //     subPricesAssets.current.add(asset);
  //     // TODO: refactor stream context to support decoupling this logic
  //     // Garbage collect unsubscribed asset prices
  //     assetPricesFamily.remove(asset);
  //   }
  //   if (ws?.current?.readyState === WebSocket.OPEN) {
  //     ws.current.send(createRequest({ type: 'subscribe:prices', assets: assets }));
  //   }
  // }, []);

  // const unsubscribePrices = useCallback((assets: string[]) => {
  //   for (const asset of assets) {
  //     subPricesAssets.current.delete(asset);
  //   }
  //   if (ws?.current?.readyState === WebSocket.OPEN) {
  //     ws.current.send(createRequest({ type: 'unsubscribe:prices', assets: assets }));
  //   }
  // }, []);

  const init = useCallback(() => {
    const initws = new WebSocket(WS_URL);
    ws.current = initws;

    // Resubscribe to existing
    initws.onopen = () => {
      if (subRecentTokenList.current) {
        subscribeRecentTokenList();
      }
      if (subPools.current) {
        subscribePools(Array.from(subPools.current));
      }
      if (subTxnsAssets.current) {
        subscribeTxns(Array.from(subTxnsAssets.current));
      }
      // if (subPricesAssets.current) {
      //   subscribePrices(Array.from(subPricesAssets.current));
      // }
    };

    initws.onmessage = (event) => {
      const msg: StreamResponse = JSON.parse(event.data);

      setDataStreamMsg(msg);

      // We assume all actions are related to the subscribed token-tx-table
      if (msg.type === 'actions') {
        const tokenId = msg.data?.[0]?.asset;
        // Update token tx
        queryClient.setQueriesData(
          {
            type: 'active',
            queryKey: ApeQueries.tokenTxs({ id: tokenId }).queryKey,
          },
          (prev?: InfiniteData<QueryData<typeof ApeQueries.tokenTxs>>) => {
            if (!prev?.pages || prev.pages.length === 0) {
              return;
            }
            const firstPage = prev.pages[0];
            if (!firstPage) {
              return;
            }
            const next = firstPage.next;

            // Update first page data
            const firstPageTxs = firstPage ? [...firstPage.txs] : [];
            firstPageTxs.unshift(...msg.data);

            // Overwrite previous first page
            const newPages = prev.pages.slice(1);
            newPages.unshift({ txs: firstPageTxs, next, args: { ...firstPage.args } });

            return {
              pages: newPages,
              pageParams: prev.pageParams,
            };
          }
        );
      }
    };

    initws.onerror = (err) => {
      console.error('WebSocket error:', err);
      initws.close();
    };

    initws.onclose = async () => {
      if (!shouldReconnect.current) return;
      await delay(RECONNECT_DELAY_MILLIS);
      init();
    };

    return () => {
      initws?.close();
    };
  }, [queryClient, setDataStreamMsg, subscribePools, subscribeRecentTokenList, subscribeTxns]);

  useEffect(() => {
    const cleanup = init();
    return () => {
      shouldReconnect.current = false;
      cleanup();
    };
  }, [init]);

  return (
    <DataStreamContext.Provider
      value={{
        subscribePools,
        unsubscribePools,
        subscribeRecentTokenList,
        unsubscribeRecentTokenList,
        subscribeTxns,
        unsubscribeTxns,
      }}
    >
      {children}
    </DataStreamContext.Provider>
  );
};

export const useDataStream = () => {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error('useDataStream must be used within DataStreamProvider');
  }
  return context;
};

function createRequest(req: StreamRequest): string {
  return JSON.stringify({ ...req });
}
