import { Bar, ResolutionString } from '@/components/AdvancedTradingView/charting_library';
import { Tx } from '@/components/Explore/types';
import {
  ChartTimeInterval,
  chartTimeIntervalToMillis,
  resolutionToChartTimeInterval,
} from '@/components/TokenChart/intervals';

export function getNextBar(
  mostRecentBar: Bar | undefined,
  swaps: Tx[],
  resolution: ResolutionString,
  baseAssetCircSupply?: number | undefined // if number, chart is showing mcap instead of price
): Bar | undefined {
  if (!mostRecentBar || swaps.length === 0) {
    return mostRecentBar;
  }

  const newBar = constructBars(
    swaps,
    resolutionToChartTimeInterval[resolution],
    baseAssetCircSupply
  )[0];

  if (newBar.time > mostRecentBar.time) {
    // If constructing a new bar, we take into consideration the previous bar's close
    return {
      ...newBar,
      open: mostRecentBar.close,
      high: Math.max(mostRecentBar.close, newBar.high),
      low: Math.min(mostRecentBar.close, newBar.low),
    };
  }

  // If not a new bar, we merge the bar data together
  return {
    time: mostRecentBar.time,
    open: mostRecentBar.open,
    high: Math.max(mostRecentBar.high, newBar.high),
    low: Math.min(mostRecentBar.low, newBar.low),
    close: newBar.close,
    volume: (mostRecentBar.volume ?? 0) + (newBar.volume ?? 0),
  };
}

/**
 * Returns `OHLC` candle data needed for Trading View charts.
 * Assumes `swaps` are sorted by timestamp in ascending order.
 */
function constructBars(
  swaps: Tx[],
  timeInterval: ChartTimeInterval,
  baseAssetCircSupply?: number | undefined // if number, chart is showing mcap instead of price
): Bar[] {
  const startMillis: number = getTimeIntervalStart(swaps[0].timestamp, timeInterval).valueOf();
  const endMillis: number = getTimeIntervalStart(
    swaps[swaps.length - 1].timestamp,
    timeInterval
  ).valueOf();

  const grouping: Record<string, Tx[]> = {};

  // init grouping with empty data by each unix time interval
  const intervalMillis: number = chartTimeIntervalToMillis[timeInterval];
  for (let t = startMillis; t <= endMillis; t += intervalMillis) {
    grouping[t] = [];
  }

  // assign transactions to their appropriate time interval
  for (const tx of swaps) {
    const group = getTimeIntervalStart(tx.timestamp, timeInterval).valueOf();
    grouping[group].push(tx);
  }

  const bars: Bar[] = Object.entries(grouping).map(([timestamp, txs]) => {
    const prices: number[] = txs
      .map((tx) => tx.usdPrice)
      .map((price) => price * (baseAssetCircSupply ?? 1));
    return {
      time: Number(timestamp),
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
      volume: txs.reduce((vol, tx) => vol + tx.usdVolume, 0),
    };
  });

  return bars;
}

function getTimeIntervalStart(timestamp: string | Date, timeInterval: ChartTimeInterval): Date {
  const timestampMillis = new Date(timestamp).valueOf();
  const intervalMillis = chartTimeIntervalToMillis[timeInterval];
  const startMillis = timestampMillis - (timestampMillis % intervalMillis);
  return new Date(startMillis);
}
