import { ResolutionString } from '../AdvancedTradingView/charting_library';

export const ChartTimeInterval = {
  ONE_SECOND: '1_SECOND',
  FIFTEEN_SECOND: '15_SECOND',
  THIRTY_SECOND: '30_SECOND',
  ONE_MINUTE: '1_MINUTE',
  THREE_MINUTE: '3_MINUTE',
  FIVE_MINUTE: '5_MINUTE',
  FIFTEEN_MINUTE: '15_MINUTE',
  THIRTY_MINUTE: '30_MINUTE',
  ONE_HOUR: '1_HOUR',
  TWO_HOUR: '2_HOUR',
  FOUR_HOUR: '4_HOUR',
  EIGHT_HOUR: '8_HOUR',
  TWELVE_HOUR: '12_HOUR',
  ONE_DAY: '1_DAY',
  ONE_WEEK: '1_WEEK',
  ONE_MONTH: '1_MONTH',
} as const;
export type ChartTimeInterval = (typeof ChartTimeInterval)[keyof typeof ChartTimeInterval];

export const chartTimeIntervalToMillis = {
  [ChartTimeInterval.ONE_SECOND]: 1000,
  [ChartTimeInterval.FIFTEEN_SECOND]: 15000,
  [ChartTimeInterval.THIRTY_SECOND]: 30000,
  [ChartTimeInterval.ONE_MINUTE]: 60000,
  [ChartTimeInterval.THREE_MINUTE]: 180000,
  [ChartTimeInterval.FIVE_MINUTE]: 300000,
  [ChartTimeInterval.FIFTEEN_MINUTE]: 900000,
  [ChartTimeInterval.THIRTY_MINUTE]: 1800000,
  [ChartTimeInterval.ONE_HOUR]: 3600000,
  [ChartTimeInterval.TWO_HOUR]: 7200000,
  [ChartTimeInterval.FOUR_HOUR]: 14400000,
  [ChartTimeInterval.EIGHT_HOUR]: 28800000,
  [ChartTimeInterval.TWELVE_HOUR]: 43200000,
  [ChartTimeInterval.ONE_DAY]: 86400000,
  [ChartTimeInterval.ONE_WEEK]: 604800000,
  [ChartTimeInterval.ONE_MONTH]: 2592000000,
} as const;

export const resolutionToChartTimeInterval: Record<string, ChartTimeInterval> = {
  '1S': ChartTimeInterval.ONE_SECOND,
  '15S': ChartTimeInterval.FIFTEEN_SECOND,
  '30S': ChartTimeInterval.THIRTY_SECOND,
  '1': ChartTimeInterval.ONE_MINUTE,
  '3': ChartTimeInterval.THREE_MINUTE,
  '5': ChartTimeInterval.FIVE_MINUTE,
  '15': ChartTimeInterval.FIFTEEN_MINUTE,
  '30': ChartTimeInterval.THIRTY_MINUTE,
  '60': ChartTimeInterval.ONE_HOUR,
  '120': ChartTimeInterval.TWO_HOUR,
  '240': ChartTimeInterval.FOUR_HOUR,
  '480': ChartTimeInterval.EIGHT_HOUR,
  '720': ChartTimeInterval.TWELVE_HOUR,
  '1D': ChartTimeInterval.ONE_DAY,
  '1W': ChartTimeInterval.ONE_WEEK,
  '1M': ChartTimeInterval.ONE_MONTH,
};

export const SUPPORTED_RESOLUTIONS: ResolutionString[] = Object.keys(
  resolutionToChartTimeInterval
) as ResolutionString[];

export const FAVORITE_INTERVALS: ResolutionString[] = ['1', '30', '1h'] as ResolutionString[];
