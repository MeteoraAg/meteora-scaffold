import { ResolutionString } from '@/components/AdvancedTradingView/charting_library';

import { GetChartRequest } from '@/components/Explore/types';

export type ChartConfig = {
  lastInterval: ResolutionString;
  chartType: GetChartRequest['type'];
  showDevTrades: boolean;
  showUserTrades: boolean;
};

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  lastInterval: '15' as ResolutionString,
  chartType: 'price',
  showDevTrades: true,
  showUserTrades: true,
};
