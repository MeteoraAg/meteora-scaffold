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
} as const;
export type Launchpad = (typeof Launchpad)[keyof typeof Launchpad];

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
