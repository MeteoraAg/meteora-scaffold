import {
  Bar,
  GetMarksCallback,
  Mark,
  ResolutionString,
  SubscribeBarsCallback,
} from '@/components/AdvancedTradingView/charting_library';
import {
  MutableRefObject,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';
import { Pool } from './types';
import { GetChartRequest } from '@/components/Explore/types';
import { useDataStreamListener } from './DataStreamProvider';
import { useTokenInfo } from '@/hooks/queries';
import { useWallet } from '@jup-ag/wallet-adapter';
import { asMarks } from './TokenChart/marks';
import { getNextBar } from './TokenChart/bars';

const SMALL_TRADE_VALUE = 0.05;

type ITokenChartContext = {
  onNewSwapTxsRef: MutableRefObject<SubscribeBarsCallback | undefined>;
  resolutionRef: MutableRefObject<ResolutionString | undefined>;
  baseAssetRef: MutableRefObject<Pool['baseAsset'] | undefined>;
  resolutionToMostRecentBarRef: MutableRefObject<Record<string, Bar>>;
  chartTypeRef: MutableRefObject<GetChartRequest['type']>;
  userAddressRef: MutableRefObject<string | undefined>;
  onNewMarksRef: MutableRefObject<GetMarksCallback<Mark> | undefined>;
  showDevTradesRef: MutableRefObject<boolean>;
  showUserTradesRef: MutableRefObject<boolean>;
};

const TokenChartContext = createContext<ITokenChartContext | null>(null);

export const TokenChartProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const onNewSwapTxsRef = useRef<SubscribeBarsCallback | undefined>(undefined);
  const resolutionToMostRecentBarRef = useRef<Record<string, Bar>>({}); // key: `${poolAddress}`
  const resolutionRef = useRef<ResolutionString | undefined>(undefined);
  const chartTypeRef = useRef<GetChartRequest['type']>('price');
  const baseAssetRef = useRef<Pool['baseAsset'] | undefined>(undefined);
  const userAddressRef = useRef<string | undefined>(undefined);
  const onNewMarksRef = useRef<GetMarksCallback<Mark> | undefined>(undefined);
  const showDevTradesRef = useRef<boolean>(true);
  const showUserTradesRef = useRef<boolean>(true);

  // Required to calculate chart mcap
  const { data: baseAsset } = useTokenInfo((pool) => pool.baseAsset);
  useLayoutEffect(() => {
    baseAssetRef.current = baseAsset;
  }, [baseAsset, baseAssetRef]);

  // Required to display user marks
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58();

  useLayoutEffect(() => {
    userAddressRef.current = address;
  }, [address, userAddressRef]);

  useDataStreamListener(
    ['actions'],
    useCallback((get, set, msg) => {
      // Update chart data
      const resolution = resolutionRef.current;
      const baseAsset = baseAssetRef.current;
      const resolutionToMostRecentBar = resolutionToMostRecentBarRef.current;
      if (!resolution || !baseAsset || !resolutionToMostRecentBar) {
        console.error('DataStream: missing data, cannot update live chart: ', {
          resolution,
          baseAsset,
          resolutionToMostRecentBar,
        });
        return;
      }

      // Filter txs to draw on chart
      const userAddress = userAddressRef.current;
      const devAddress = baseAsset.dev;
      const filteredTxs = msg.data.filter(
        (tx) =>
          // Remove MEV swaps
          !tx.isMev &&
          // Remove tiny swaps
          tx.usdVolume >= SMALL_TRADE_VALUE &&
          // Ensure swaps are from most reliable pool OR user/dev trades
          (tx.isMrp || tx.traderAddress === userAddress || tx.traderAddress === devAddress)
      );

      if (filteredTxs.length === 0) {
        console.error('DataStream: no valid txs found, breaking!');
        return;
      }

      // Chart Marks
      const onNewMarks = onNewMarksRef.current;
      const showDevTrades = showDevTradesRef.current;
      if (onNewMarks && showDevTrades && devAddress) {
        const devSwaps = filteredTxs.filter((action) => action.traderAddress === devAddress);
        if (devSwaps.length > 0) {
          const marks = asMarks(
            devSwaps,
            { id: baseAsset.id, circSupply: baseAsset.circSupply },
            true
          );
          onNewMarks(marks);
        }
      }
      const showUserTrades = showUserTradesRef.current;
      if (onNewMarks && showUserTrades && userAddress) {
        const userSwaps = filteredTxs.filter((action) => action.traderAddress === userAddress);
        if (userSwaps.length > 0) {
          const marks = asMarks(userSwaps, { id: baseAsset.id, circSupply: baseAsset.circSupply });
          onNewMarks(marks);
        }
      }

      const mostRecentBarKey = baseAsset.id;
      const recentBar = resolutionToMostRecentBar[mostRecentBarKey];
      if (!recentBar) {
        console.error(
          "DataStream: 'mostRecentBarKey' key not found in 'resolutionToMostRecentBar': ",
          {
            resolutionToMostRecentBar,
            mostRecentBarKey,
          }
        );
        return;
      }

      const nextBar = getNextBar(
        recentBar,
        filteredTxs,
        resolution,
        chartTypeRef.current === 'mcap' ? baseAsset.circSupply : 1
      );
      if (!nextBar) {
        console.error("DataStream: missing 'nextBar': ", {
          nextBar,
        });
        return;
      }

      // copy is necessary since TV mutates the bar
      resolutionToMostRecentBar[mostRecentBarKey] = structuredClone(nextBar);

      const callback = onNewSwapTxsRef.current;
      if (!callback) {
        console.error('DataStream: failed to update chart with latest txs!');
        return;
      }
      callback(nextBar);
    }, [])
  );

  return (
    <TokenChartContext.Provider
      value={{
        onNewSwapTxsRef,
        resolutionRef,
        baseAssetRef,
        resolutionToMostRecentBarRef,
        chartTypeRef,
        userAddressRef,
        onNewMarksRef,
        showUserTradesRef,
        showDevTradesRef,
      }}
    >
      {children}
    </TokenChartContext.Provider>
  );
};

export const useTokenChart = () => {
  const context = useContext(TokenChartContext);
  if (!context) {
    throw new Error('useTokenChart must be used within TokenChartProvider');
  }
  return context;
};
