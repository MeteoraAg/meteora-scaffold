import { assertNever } from '@/lib/utils';
import {
  Asset,
  normalizeSortByField,
  Pool,
  TokenListFilters,
  TokenListSortBy,
  TokenListSortByField,
  TokenListSortDir,
  TokenListTab,
  TokenListTimeframe,
} from '@/components/Explore/types';

export function getSorterFieldValue(
  field: TokenListSortByField,
  timeframe: TokenListTimeframe,
  pool: Pool
) {
  const stats = pool.baseAsset[`stats${timeframe}`];
  switch (field) {
    case 'listedTime':
      return new Date(pool.createdAt).getTime();
    case 'priceChange':
      return stats?.priceChange;
    case 'liquidity':
      return pool.baseAsset.liquidity;
    case 'volume':
      if (stats?.buyVolume === undefined && stats?.sellVolume === undefined) {
        return;
      }
      return (stats.buyVolume ?? 0) + (stats.sellVolume ?? 0);
    case 'txs':
      if (stats?.numBuys === undefined && stats?.numSells === undefined) {
        return;
      }
      return (stats.numBuys ?? 0) + (stats.numSells ?? 0);
    case 'netTxs':
      if (stats?.numBuys === undefined && stats?.numSells === undefined) {
        return;
      }
      return (stats.numBuys ?? 0) - (stats.numSells ?? 0);
    case 'traders':
      return stats?.numTraders;
    case 'numNetBuyers':
      if (stats?.numNetBuyers === undefined || stats?.numTraders === undefined) {
        return;
      }
      const numNetSellers = stats.numTraders - stats.numNetBuyers;
      return stats.numNetBuyers - numNetSellers;
    case 'usdPrice':
      return pool.baseAsset.usdPrice;
    case 'mcap':
      return pool.baseAsset.mcap;
    case 'fdv':
      return pool.baseAsset.fdv;
    case 'holderCount':
      return pool.baseAsset.holderCount;
    case 'organicScore':
      return pool.baseAsset.organicScore;
    case 'organicScore':
      return pool.baseAsset.organicScore;
    case 'numOrganicBuyers':
      return stats?.numOrganicBuyers;
    case 'ctLikes':
      return pool.baseAsset.ctLikes;
    case 'smartCtLikes':
      return pool.baseAsset.smartCtLikes;
    case 'holderChange':
      return stats?.holderChange;
    case 'netVolume':
      if (stats?.buyVolume === undefined && stats?.sellVolume === undefined) {
        return;
      }
      return (stats?.buyVolume ?? 0) - (stats?.sellVolume ?? 0);
    case 'organicVolume':
      if (stats?.buyOrganicVolume === undefined && stats?.sellOrganicVolume === undefined) {
        return;
      }
      return (stats?.buyOrganicVolume ?? 0) + (stats?.sellOrganicVolume ?? 0);
    case 'netOrganicVolume':
      if (stats?.buyOrganicVolume === undefined && stats?.sellOrganicVolume === undefined) {
        return;
      }
      return (stats?.buyOrganicVolume ?? 0) - (stats?.sellOrganicVolume ?? 0);
    case 'bondingCurve':
      return pool.bondingCurve;
    case 'graduatedAt':
      // bonded only launchpads don't have graduated pool/at
      if (pool.baseAsset.launchpad !== 'pump.fun' && pool.baseAsset.launchpad === 'virtuals') {
        return new Date(pool.createdAt).getTime();
      }
      return new Date(pool.createdAt).getTime();
    default:
      assertNever(field, `unknown field '${field}'`);
  }
}

export function createPoolSorter(
  sorter: {
    sortBy: TokenListSortByField | TokenListSortBy;
    sortDir: TokenListSortDir;
  },
  timeframe: TokenListTimeframe
) {
  const sortBy = normalizeSortByField(sorter.sortBy);

  const asc = sorter.sortDir === 'asc';
  return (a: Pool, b: Pool) => {
    const aVal = getSorterFieldValue(sortBy, timeframe, a);
    const bVal = getSorterFieldValue(sortBy, timeframe, b);
    if (aVal === bVal) {
      return 0;
    }
    if (aVal === undefined) {
      return asc ? -1 : 1;
    }
    if (bVal === undefined) {
      return asc ? 1 : -1;
    }

    if (aVal > bVal) {
      return asc ? 1 : -1;
    }
    return asc ? -1 : 1;
  };
}

export function watchlistSortBy(timeframe: TokenListTimeframe): TokenListSortBy | undefined {
  return `volume${timeframe}`;
}

export function categorySortBy(
  category: TokenListTab,
  timeframe: TokenListTimeframe
): TokenListSortBy | undefined {
  switch (category) {
    case TokenListTab.NEW:
      return 'listedTime';
    case TokenListTab.GRADUATING:
      return `bondingCurve`;
    case TokenListTab.GRADUATED:
      return 'graduatedAt';
    default:
      assertNever(category);
  }
}

export function categorySortDir(category: TokenListTab): TokenListSortDir {
  switch (category) {
    default:
      return 'desc';
  }
}

export function sortPools(
  pools: Pool[],
  options: { tab: TokenListTab; timeframe: TokenListTimeframe }
) {
  const sortDir = categorySortDir(options.tab);
  let sortBy: TokenListSortByField | undefined;
  const defaultSortBy = categorySortBy(options.tab, options.timeframe);
  if (defaultSortBy) {
    sortBy = normalizeSortByField(defaultSortBy);
  }

  if (sortBy) {
    const sorter = createPoolSorter({ sortBy, sortDir }, options.timeframe);
    pools.sort(sorter);
  }
}

export const AUDIT_TOP_HOLDERS_THRESHOLD = 15;
export const AUDIT_MAX_SCORE = 3;

type Audit = Pool['baseAsset']['audit'];

export function isAuditTopHoldersPass(audit: Audit) {
  return (
    audit?.topHoldersPercentage !== undefined &&
    audit.topHoldersPercentage < AUDIT_TOP_HOLDERS_THRESHOLD
  );
}

export function getAuditScore(audit?: Audit) {
  if (!audit) return;

  return (
    (audit.mintAuthorityDisabled ? 1 : 0) +
    (audit.freezeAuthorityDisabled ? 1 : 0) +
    (isAuditTopHoldersPass(audit) ? 1 : 0)
  );
}

export function getAuditScoreColorCn(score?: number) {
  if (score === undefined) {
    return 'text-neutral-500';
  }

  if (score >= AUDIT_MAX_SCORE) {
    return 'text-emerald';
  }

  if (score >= 2) {
    return 'text-amber';
  }

  return 'text-neutral-400';
}

export function getOrganicScoreColorCn(label: 'high' | 'medium' | 'low') {
  if (label === 'high') {
    return 'text-emerald';
  }

  return 'text-neutral-400';
}

export function formatAssetAsTokenInfo(asset: Asset) {
  const volume =
    asset.stats24h?.buyVolume === undefined && asset.stats24h?.sellVolume === undefined
      ? undefined
      : (asset.stats24h?.buyVolume ?? 0) + (asset.stats24h?.sellVolume ?? 0);

  // satifies TokenInfo
  return {
    id: asset.id,
    chainId: 101, // Solana
    address: asset.id,
    name: asset.name,
    decimals: asset.decimals,
    symbol: asset.symbol,
    logoURI: asset.icon,
    tags: asset.isVerified ? ['verified' as const] : [],
    daily_volume: volume,
    website: asset.website,
    twitter: asset.twitter,
    telegram: asset.telegram,
    organicScore: asset.organicScore ?? 0,
    organicScoreLabel: asset.organicScoreLabel,
    ctLikes: asset.ctLikes ?? 0,
    launchpad: asset.launchpad,
    mcap: asset.mcap,
    liquidity: asset.liquidity,
  };
}

export function formatPoolAsTokenInfo(pool: Pool) {
  const tokenInfo = formatAssetAsTokenInfo(pool.baseAsset);
  return Object.assign(tokenInfo, {
    created_at: pool.createdAt,
  });
}

/**
 * Updates a pool that was streamed with existing pool data that might be missing from streamed pools.
 *
 * @param streamedPool - Pool from stream
 * @param existingPool - Pool from existing data
 * @returns Streamed pool with updated data
 */
export function patchStreamPool(streamedPool: Pool, existingPool: Pool) {
  // preserve existing streamed state
  streamedPool.streamed = existingPool.streamed;

  // pool updates do not have holder count
  streamedPool.baseAsset.holderCount ??= existingPool.baseAsset.holderCount;
  streamedPool.baseAsset.organicScore ??= existingPool.baseAsset.organicScore;

  // dont update created at if token graduated, but this streamed pool is not the graduated pool
  streamedPool.createdAt =
    streamedPool.baseAsset.graduatedPool && streamedPool.id !== streamedPool.baseAsset.graduatedPool
      ? existingPool.createdAt
      : streamedPool.createdAt;

  return streamedPool;
}
