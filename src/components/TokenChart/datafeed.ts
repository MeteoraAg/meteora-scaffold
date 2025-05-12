import { MutableRefObject } from 'react';

import { SUPPORTED_RESOLUTIONS, resolutionToChartTimeInterval } from './intervals';
import {
  Bar,
  GetMarksCallback,
  IDatafeedChartApi,
  IExternalDatafeed,
  LibrarySymbolInfo,
  Mark,
  SubscribeBarsCallback,
} from '../AdvancedTradingView/charting_library';
import { GetChartRequest, Pool } from '../Explore/types';
import { ApeClient } from '../Explore/client';
import { asMarks } from '@/contexts/TokenChart/marks';

export type ISymbolInfo = LibrarySymbolInfo & { address: string };

export function createDataFeed(
  baseAssetRef: MutableRefObject<Pool['baseAsset'] | undefined>,
  resolutionToMostRecentBarRef: MutableRefObject<Record<string, Bar>>,
  onNewSwapTxsRef: MutableRefObject<SubscribeBarsCallback | undefined>,
  chartTypeRef: MutableRefObject<GetChartRequest['type']>,
  userAddressRef: MutableRefObject<string | undefined>,
  onNewMarksRef: MutableRefObject<GetMarksCallback<Mark> | undefined>,
  showDevTradesRef: MutableRefObject<boolean>,
  showUserTradesRef: MutableRefObject<boolean>,
  isMarksLoadingRef: MutableRefObject<boolean>,
  resetCacheFnRef: MutableRefObject<Record<string, () => void>>
): IExternalDatafeed & IDatafeedChartApi {
  return {
    onReady: (callback) => {
      setTimeout(() =>
        callback({
          supported_resolutions: SUPPORTED_RESOLUTIONS,
          supports_marks: true,
          exchanges: [],
        })
      );
    },

    searchSymbols: async () => {},

    // TV calls this function on init, and expects ISymbolInfo
    resolveSymbol: async (_, onSymbolResolvedCallback) => {
      const symbol = `${baseAssetRef.current?.symbol.toUpperCase()}/USD`;
      const symbolInfo: ISymbolInfo = {
        name: symbol,
        ticker: symbol,
        address: symbol,
        full_name: symbol,
        // Required to display symbol on chart since `symbolTextSource` is `description` by default
        // @see https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.ChartPropertiesOverrides/#mainseriespropertiesstatusviewstylesymboltextsource
        description: symbol,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        minmov: 0.001, // forces ticks to have 3 more decimals; do not put exactly 0.00001 as it causes an unexpected error
        pricescale: 10 ** 16,
        has_no_volume: true,
        visible_plots_set: 'ohlc', // show volume by default (https://github.com/tradingview/charting_library/issues/7692)
        has_weekly_and_monthly: false,
        volume_precision: 2,
        data_status: 'streaming',
        exchange: 'jup.ag',
        listed_exchange: '',
        format: 'price',

        supported_resolutions: SUPPORTED_RESOLUTIONS,
        intraday_multipliers: SUPPORTED_RESOLUTIONS,
        seconds_multipliers: SUPPORTED_RESOLUTIONS,
        has_empty_bars: false, // must be false for heikin ashi to work
        has_intraday: true, // to allow choosing resolutions below 1D
        has_seconds: true, // to allow choosing second resolutions
      };
      setTimeout(() => onSymbolResolvedCallback(symbolInfo));
    },

    getBars: async (_, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
      const baseAsset = baseAssetRef.current;
      try {
        if (!baseAsset) {
          console.error('TokenChart.getBars: missing baseAsset: ', { baseAsset });
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }

        const params = {
          interval: resolutionToChartTimeInterval[resolution],
          baseAsset: baseAsset.id,
          from: Math.max(0, periodParams.from) * 1000, // prevent TV from requesting a negative value
          to: periodParams.to * 1000,
          candles: periodParams.countBack,
          type: chartTypeRef.current,
        };
        const apeRes = await ApeClient.getChart(baseAsset.id, params);
        const rawBars = apeRes.candles.map((candle) => ({
          address: baseAsset.id,
          c: candle.close,
          h: candle.high,
          l: candle.low,
          o: candle.open,
          t: candle.time * 1000,
          v: candle.volume,
        }));

        if (rawBars.length === 0) {
          console.error('[getBars]: 0 bars returned from query');
          // "noData" should be set if there is no data in the requested period.
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }

        const bars: Bar[] = rawBars.map((bar) => {
          const lastBarTime = bar.t;
          return {
            time: lastBarTime,
            low: bar.l,
            high: bar.h,
            open: bar.o,
            close: bar.c,
            volume: bar.v,
          };
        });

        if (periodParams.firstDataRequest) {
          const key = `${baseAsset.id}`;
          // store most recent bar on first request (copy is necessary since TV mutates it)
          resolutionToMostRecentBarRef.current[key] = structuredClone(bars[bars.length - 1]);
        }

        onHistoryCallback(bars, {
          noData: false,
        });
      } catch (error: any) {
        onErrorCallback(String(error));
      }
    },

    subscribeBars: (
      _,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    ) => {
      const baseAssetId = baseAssetRef.current?.id;
      if (!baseAssetId) {
        console.error('subscribeBars: base asset id missing!');
        return;
      }
      const key = `${baseAssetId}`;
      onNewSwapTxsRef.current = onRealtimeCallback;
      resetCacheFnRef.current[key] = onResetCacheNeededCallback;
    },

    getMarks: async (_, from, to, onDataCallback) => {
      onNewMarksRef.current = onDataCallback;

      const baseAsset = baseAssetRef.current;
      if (!baseAsset) {
        console.error('getMarks: missing baseAsset!');
        return;
      }

      const userAddress = userAddressRef.current;
      const showDevTrades = showDevTradesRef.current;
      const showUserTrades = showUserTradesRef.current;
      const assetId = baseAsset.id;
      const devAddress = baseAsset.dev;

      const hasMarks = (!!userAddress && showUserTrades) || (!!devAddress && showDevTrades);
      if (!hasMarks) {
        return;
      }

      const fromDate = new Date(from * 1000);
      const toDate = new Date(to * 1000);

      isMarksLoadingRef.current = true;

      // TODO: Handle pagination
      const tasks: Promise<void>[] = [];

      if (devAddress && showDevTrades) {
        try {
          const devTask = ApeClient.getTokenTxs(assetId, {
            traderAddress: devAddress,
            fromTs: fromDate,
            toTs: toDate,
          }).then((devActions) => {
            const devMarks = asMarks(
              devActions.txs,
              { id: baseAsset.id, circSupply: baseAsset.circSupply },
              true
            );
            onDataCallback(devMarks);
          });
          tasks.push(devTask);
        } catch (err) {
          console.error(`getMarks: error getting marks from ${fromDate} to ${toDate}`);
        }
      }

      if (userAddress && showUserTrades) {
        // TODO: handle in future PR
        // Reset
        // setIncompleteUserMarks();

        // TODO: we should change this to use from an external data source (tx table) in the future, to support loading infinitely
        const MAX_PAGES = 4;
        const fetchAllUserTrades = async () => {
          let attempt = 0;
          let next: string | undefined;

          do {
            const userActions = await ApeClient.getTokenTxs(assetId, {
              traderAddress: userAddress,
              fromTs: fromDate,
              toTs: toDate,
              offset: next,
            });

            const userMarks = asMarks(userActions.txs, {
              id: baseAsset.id,
              circSupply: baseAsset.circSupply,
            });
            onDataCallback(userMarks);

            next = userActions.next;
            attempt += 1;

            if (!next) {
              break;
            }

            if (attempt >= MAX_PAGES) {
              // TODO: handle in future PR
              // setIncompleteUserMarks({
              //   address: userAddress,
              //   assetId: currentPool.baseAsset.id,
              // });
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
          } while (next && attempt < MAX_PAGES);
        };

        tasks.push(fetchAllUserTrades());
      }

      await Promise.allSettled(tasks);
      isMarksLoadingRef.current = false;
    },
    unsubscribeBars: () => {},
  };
}
