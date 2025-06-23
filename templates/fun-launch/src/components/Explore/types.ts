import * as z from 'superstruct';

export const ExploreTab = {
  NEW: 'recent',
  GRADUATING: 'aboutToGraduate',
  GRADUATED: 'graduated',
} as const;
export type ExploreTab = (typeof ExploreTab)[keyof typeof ExploreTab];

export const TokenListTab = {
  ...ExploreTab,
} as const;
export type TokenListTab = (typeof TokenListTab)[keyof typeof TokenListTab];

export type GetTokenRequest = {
  id: string;
};

export type GetTokensRequest = {
  ids: string[];
};

export type GetTokenResponse = {
  pools: [] | Pool[];
};

export const TokenListTimeframe = {
  MIN_5: '5m',
  HOUR_1: '1h',
  HOUR_6: '6h',
  HOUR_24: '24h',
} as const;
export type TokenListTimeframe = (typeof TokenListTimeframe)[keyof typeof TokenListTimeframe];
const TokenListTimeframeRegex = new RegExp(`(?:${Object.values(TokenListTimeframe).join('|')})$`);

export const TokenListBaseSortBy = [
  'usdPrice',
  'liquidity',
  'mcap',
  'fdv',
  'listedTime',
  'holderCount',
  'organicScore',
  'ctLikes',
  'smartCtLikes',
  'bondingCurve',
  'graduatedAt',
] as const;
type TokenListBaseSortBy = (typeof TokenListBaseSortBy)[number];
export function isTokenListBaseSortBy(sortBy: string): sortBy is TokenListBaseSortBy {
  return TokenListBaseSortBy.includes(sortBy as TokenListBaseSortBy);
}

export const TokenListTimeframeSortByPrefix = [
  'priceChange',
  'txs',
  'netTxs',
  'traders',
  'numNetBuyers',
  'volume',
  'netVolume',
  'holderChange',
  'numOrganicBuyers',
  'organicVolume',
  'netOrganicVolume',
] as const;
type TokenListTimeframeSortByPrefix = (typeof TokenListTimeframeSortByPrefix)[number];
export function isTokenListTimeframeSortByPrefix(
  sortBy: string
): sortBy is TokenListTimeframeSortByPrefix {
  return TokenListTimeframeSortByPrefix.includes(sortBy as TokenListTimeframeSortByPrefix);
}

type TokenListTimeframeSortBy = `${TokenListTimeframeSortByPrefix}${TokenListTimeframe}`;
export const TokenListTimeframeSortBy = TokenListTimeframeSortByPrefix.flatMap((prefix) =>
  Object.values(TokenListTimeframe).map((timeframe) => `${prefix}${timeframe}` as const)
);
export function isTokenListTimeframeSortBy(sortBy: string): sortBy is TokenListTimeframeSortBy {
  return TokenListTimeframeSortBy.includes(sortBy as TokenListTimeframeSortBy);
}
export function normalizeSortByField(
  sortBy: TokenListSortByField | TokenListSortBy
): TokenListSortByField {
  return isTokenListTimeframeSortBy(sortBy) ? stripTokenListTimeframeSortBy(sortBy) : sortBy;
}
function stripTokenListTimeframeSortBy(
  sortBy: TokenListTimeframeSortBy
): TokenListTimeframeSortByPrefix {
  return sortBy.replace(TokenListTimeframeRegex, '') as TokenListTimeframeSortByPrefix;
}

export type TokenListSort = {
  sortBy: TokenListSortByField;
  sortDir: TokenListSortDir;
};

export const TokenListSortByField = [
  ...TokenListBaseSortBy,
  ...TokenListTimeframeSortByPrefix,
] as const;
export type TokenListSortByField = (typeof TokenListSortByField)[number];

export const TokenListSortBy = [...TokenListBaseSortBy, ...TokenListTimeframeSortBy] as const;
export type TokenListSortBy = (typeof TokenListSortBy)[number];
export type TokenListSortDir = 'asc' | 'desc';

export const Launchpad = {
  PUMPFUN: 'pump.fun',
  VIRTUALS: 'virtuals',
  DAOSFUN: 'daos.fun',
  TIMEFUN: 'time.fun',
  GOFUNDMEME: 'GoFundMeme',
  DEALR: 'dealr.fun',
  DIALECT: 'Dialect',
  DBC: 'met-dbc',
  LETSBONKFUN: 'letsbonk.fun',
  RAYDIUM: 'Raydium',
  COOKMEME: 'cook.meme',
  BELIEVE: 'Believe',
  BOOP: 'boop',
  XCOMBINATOR: 'xcombinator',
  MENTATFUN: 'mentat.fun',
} as const;
export type Launchpad = (typeof Launchpad)[keyof typeof Launchpad];

export const TokenListFiltersSchema = z.object({
  partnerConfigs: z.optional(z.array(z.string())),
});
export type TokenListFilters = z.Infer<typeof TokenListFiltersSchema>;

type TokenListFilter = keyof TokenListFilters;

export function resolveTokenListFilter(filter: TokenListFilter, timeframe: TokenListTimeframe) {
  return filter;
}

export function resolveTokenListFilters(
  filters: TokenListFilters | undefined
): ResolvedTokenListFilters | undefined {
  if (!filters) {
    return;
  }
  // We can't use ResolvedTokenListFilters as the assignment is not type safe
  const resolved: Record<string, TokenListFilters[keyof TokenListFilters]> = {};
  for (const filter in filters) {
    resolved[filter] = filters[filter as TokenListFilter];
  }
  return resolved;
}

export type ResolvedTokenListFilters = {
  [K in TokenListFilter]?: TokenListFilters[K];
};

export type GetCategoryTokenListResponse = {
  pools: Pool[];
};

export type GetGemsTokenListRequest = Partial<
  Record<ExploreTab, GetGemsTokenListIndividualRequest>
>;
export type GetGemsTokenListResponse = Partial<
  Record<ExploreTab, GetGemsTokenListIndividualResponse>
>;

export type GetGemsTokenListIndividualRequest = ResolvedTokenListFilters & {
  timeframe: TokenListTimeframe;
};
export type GetGemsTokenListIndividualResponse = {
  pools: Pool[];
};

export type Pool = {
  id: string;
  chain: string;
  dex: string;
  type: string;
  createdAt: string;
  bondingCurve: number | undefined;
  volume24h: number | undefined;
  isUnreliable: boolean | undefined;
  updatedAt: string;

  baseAsset: {
    id: string;
    name: string;
    symbol: string;
    icon?: string | undefined;
    decimals: number;
    twitter?: string | undefined;
    telegram?: string | undefined;
    website?: string | undefined;
    dev?: string | undefined;
    circSupply?: number | undefined;
    totalSupply?: number | undefined;
    tokenProgram: string;
    launchpad?: Launchpad | (string & {}) | undefined;
    /**
     * ISO Date string
     */
    graduatedAt?: string | undefined;
    graduatedPool?: string | undefined;
    firstPool?:
      | {
          id: string;
          dex: string;
          createdAt: string;
        }
      | undefined;
    holderCount?: number | undefined;
    fdv?: number | undefined;
    mcap?: number | undefined;
    usdPrice?: number | undefined;
    priceBlockId?: number | undefined;
    liquidity?: number | undefined;
    stats5m?: SwapStats | undefined;
    stats1h?: SwapStats | undefined;
    stats6h?: SwapStats | undefined;
    stats24h?: SwapStats | undefined;
    audit?:
      | {
          mintAuthorityDisabled: boolean | undefined;
          freezeAuthorityDisabled: boolean | undefined;
          topHoldersPercentage: number | undefined;
          lpBurnedPercentage: number | undefined;
          devBalancePercentage?: number;
          devMigrations?: number;
        }
      | undefined;
    organicScore?: number | undefined;
    organicScoreLabel: 'high' | 'medium' | 'low';
    isVerified?: boolean | undefined;
    ctLikes?: number | undefined;
    smartCtLikes?: number | undefined;
  };

  // frontend field
  streamed?: boolean;
};

export type Asset = Pool['baseAsset'];

export type SwapStats = {
  priceChange?: number | undefined;
  volumeChange?: number | undefined;
  liquidityChange?: number | undefined;
  holderChange?: number | undefined;
  buyVolume?: number | undefined;
  sellVolume?: number | undefined;
  buyOrganicVolume?: number | undefined;
  sellOrganicVolume?: number | undefined;
  numBuys?: number | undefined;
  numSells?: number | undefined;
  numTraders?: number | undefined;
  numOrganicBuyers?: number | undefined;
  numNetBuyers?: number | undefined;
};

export type GetTxsRequest = {
  limit?: number | undefined;
  offset?: string | undefined;
  offsetTs?: Date | undefined;
  fromTs?: Date | undefined;
  toTs?: Date | undefined;
  traderAddress?: string | undefined;
};

export type GetTxsResponse = {
  txs: Tx[];
  next?: string | undefined;
};

export type Tx = {
  /**
   * Date string
   */
  timestamp: string;
  asset: string;
  type: 'buy' | 'sell';
  usdPrice: number;
  usdVolume: number;
  traderAddress: string;
  txHash: string;
  amount: number;
  isMev: boolean;
  /**
   * Whether this tx comes from the most reliable pool
   *
   * NOTE: used to determine if this tx should be
   * displayed on the chart
   */
  isMrp: boolean;
  poolId: string;
};

export type Holder = {
  address: string;
  amount: number;
  tags?: CustomHolderTag[] | undefined;
};

export type CustomHolderTag = {
  /**
   * Short form of tag, displayed beside address in holder table row
   */
  id: 'DBC' | string;
  /**
   * Long form of tag, displayed when user hovers on tag
   */
  name: string;
};

export type GetTopHoldersResponse =
  | {
      holders: Holder[];
      count: number;
    }
  | { holders: undefined; count: undefined };

export type GetTokenDescriptionResponse = {
  description?: string;
};

export type CandleStickInterval = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const ChartInterval = {
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
export type ChartInterval = (typeof ChartInterval)[keyof typeof ChartInterval];

export type GetChartRequest = {
  interval: ChartInterval;
  baseAsset: string;
  from: Date | number;
  to: Date | number;
  candles: number;
  type: 'price' | 'mcap';
};

export type GetChartResponse = {
  candles: CandleStickInterval[];
};

export const NetVolumeChartInterval = {
  FIVE_MINUTE: '5_MINUTE',
  ONE_HOUR: '1_HOUR',
  SIX_HOUR: '6_HOUR',
  ONE_DAY: '1_DAY',
} as const;
export type NetVolumeChartInterval =
  (typeof NetVolumeChartInterval)[keyof typeof NetVolumeChartInterval];
