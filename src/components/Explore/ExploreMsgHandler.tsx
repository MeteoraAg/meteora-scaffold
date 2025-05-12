import { useQueryClient } from '@tanstack/react-query';
import {
  categorySortBy,
  categorySortDir,
  createPoolSorter,
  patchStreamPool,
} from '@/components/Explore/pool-utils';
import { ApeQueries, QueryData } from '@/components/Explore/queries';
import { useDataStreamListener } from '@/contexts/DataStreamProvider';
import { ExploreTab, TokenListSortByField, normalizeSortByField } from '@/components/Explore/types';
import { assertNever } from '@/lib/utils';

export const ExploreMsgHandler: React.FC = () => {
  const queryClient = useQueryClient();

  useDataStreamListener(['updates'], (get, set, msg) => {
    queryClient.setQueriesData(
      {
        type: 'active',
        queryKey: ['explore', 'gems'],
      },
      (prev?: QueryData<typeof ApeQueries.gemsTokenList>) => {
        if (!prev) return;

        // Update, insert then re-sort
        let recentPools = prev.recent && [...prev.recent.pools];
        let aboutToGraduatePools = prev.aboutToGraduate && [...prev.aboutToGraduate.pools];
        const graduatedPools = prev.graduated && [...prev.graduated.pools];

        for (const update of msg.data) {
          if (update.type === 'new') {
            // Handle recent pools
            // Update or add
            if (recentPools) {
              const newIdx = recentPools?.findIndex(
                (p) => p.baseAsset.id === update.pool.baseAsset.id
              );
              if (newIdx !== -1) {
                recentPools[newIdx] = patchStreamPool(update.pool, recentPools[newIdx]);
              } else {
                Object.assign(update.pool, { streamed: true });
                recentPools.push(update.pool);
              }
            }

            // Handle about to graduate pools
            // Update or add if higher bonding curve
            if (aboutToGraduatePools && !update.pool.baseAsset.graduatedPool) {
              // Already sorted by bonding curve
              const minBondingCurve =
                aboutToGraduatePools[aboutToGraduatePools.length - 1]?.bondingCurve ?? 0;

              const aboutToGraduateIdx = aboutToGraduatePools.findIndex(
                (p) => p.baseAsset.id === update.pool.baseAsset.id
              );
              if (aboutToGraduateIdx !== -1) {
                aboutToGraduatePools[aboutToGraduateIdx] = patchStreamPool(
                  update.pool,
                  aboutToGraduatePools[aboutToGraduateIdx]
                );
              } else if (
                update.pool.bondingCurve !== undefined &&
                update.pool.bondingCurve > minBondingCurve
              ) {
                Object.assign(update.pool, { streamed: true });
                aboutToGraduatePools.push(update.pool);
              }
            }

            // Finish handling new updates
            continue;
          }

          if (update.type === 'graduated') {
            // Handle graduated pools
            // Update or add
            if (graduatedPools) {
              const graduatedIdx = graduatedPools.findIndex(
                (p) => p.baseAsset.id === update.pool.baseAsset.id
              );
              if (graduatedIdx !== -1) {
                graduatedPools[graduatedIdx] = patchStreamPool(
                  update.pool,
                  graduatedPools[graduatedIdx]
                );
              } else {
                Object.assign(update.pool, { streamed: true });
                graduatedPools.push(update.pool);
              }
            }

            // Handle other columns
            // Remove from other columns
            if (recentPools) {
              recentPools = recentPools.filter((p) => p.baseAsset.id !== update.pool.baseAsset.id);
            }
            if (aboutToGraduatePools) {
              aboutToGraduatePools = aboutToGraduatePools.filter(
                (p) => p.baseAsset.id !== update.pool.baseAsset.id
              );
            }

            // Finish handling graduated updates
            continue;
          }

          if (update.type === 'update') {
            // Skip unreliable pool updates, theres a bug where mcap is missing
            if (update.pool.isUnreliable) {
              continue;
            }
            // TODO: graduated update handling

            // Handle recent pools
            // Update existing
            if (recentPools) {
              const idx = recentPools.findIndex((p) => p.baseAsset.id === update.pool.baseAsset.id);
              if (idx !== -1) {
                recentPools[idx] = patchStreamPool(update.pool, recentPools[idx]);
              }
            }

            // Handle about to graduate pools
            // Update or add if higher bonding curve
            if (aboutToGraduatePools && !update.pool.baseAsset.graduatedPool) {
              const idx = aboutToGraduatePools.findIndex(
                (p) => p.baseAsset.id === update.pool.baseAsset.id
              );
              if (idx !== -1) {
                aboutToGraduatePools[idx] = patchStreamPool(update.pool, aboutToGraduatePools[idx]);
              } else {
                // Already sorted by bonding curve
                const minBondingCurve =
                  aboutToGraduatePools[aboutToGraduatePools.length - 1]?.bondingCurve ?? 0;
                if (
                  update.pool.bondingCurve !== undefined &&
                  update.pool.bondingCurve > minBondingCurve
                ) {
                  Object.assign(update.pool, { streamed: true });
                  aboutToGraduatePools.push(update.pool);
                }
              }
            }

            // Handle graduated pools
            // Update existing
            if (graduatedPools) {
              const idx = graduatedPools.findIndex(
                (p) => p.baseAsset.id === update.pool.baseAsset.id
              );
              if (idx !== -1) {
                graduatedPools[idx] = patchStreamPool(update.pool, graduatedPools[idx]);
              }
            }

            // Finish handling update
            continue;
          }

          assertNever(update.type, 'Explore stream listener received unknown update type');
        }

        const recentArgs = prev.args[ExploreTab.NEW];
        const aboutToGraduateArgs = prev.args[ExploreTab.GRADUATING];
        const graduatedArgs = prev.args[ExploreTab.GRADUATED];

        // Re-sort
        if (recentPools && recentArgs) {
          const sortDir = categorySortDir(ExploreTab.NEW);
          let sortBy: TokenListSortByField | undefined;
          if (!sortBy) {
            const defaultSortBy = categorySortBy(ExploreTab.NEW, recentArgs.timeframe);
            if (defaultSortBy) {
              sortBy = normalizeSortByField(defaultSortBy);
            }
          }

          if (sortBy) {
            const sorter = createPoolSorter(
              {
                sortBy,
                sortDir,
              },
              recentArgs.timeframe
            );
            recentPools.sort(sorter);
          }
        }

        if (aboutToGraduatePools && aboutToGraduateArgs) {
          const sortDir = categorySortDir(ExploreTab.GRADUATING);
          let sortBy: TokenListSortByField | undefined;
          if (!sortBy) {
            const defaultSortBy = categorySortBy(
              ExploreTab.GRADUATING,
              aboutToGraduateArgs.timeframe
            );
            if (defaultSortBy) {
              sortBy = normalizeSortByField(defaultSortBy);
            }
          }

          if (sortBy) {
            const sorter = createPoolSorter(
              {
                sortBy,
                sortDir,
              },
              aboutToGraduateArgs.timeframe
            );
            aboutToGraduatePools.sort(sorter);
          }
        }

        if (graduatedPools && graduatedArgs) {
          const sortDir = categorySortDir(ExploreTab.GRADUATED);
          let sortBy: TokenListSortByField | undefined;
          if (!sortBy) {
            const defaultSortBy = categorySortBy(ExploreTab.GRADUATED, graduatedArgs.timeframe);
            if (defaultSortBy) {
              sortBy = normalizeSortByField(defaultSortBy);
            }
          }

          if (sortBy) {
            const sorter = createPoolSorter(
              {
                sortBy,
                sortDir,
              },
              graduatedArgs.timeframe
            );
            graduatedPools.sort(sorter);
          }
        }

        // Truncate lists
        recentPools?.splice(30);
        aboutToGraduatePools?.splice(30);
        graduatedPools?.splice(30);

        const next: QueryData<typeof ApeQueries.gemsTokenList> = {
          [ExploreTab.NEW]: recentPools ? { pools: recentPools } : undefined,
          [ExploreTab.GRADUATING]: aboutToGraduatePools
            ? { pools: aboutToGraduatePools }
            : undefined,
          [ExploreTab.GRADUATED]: graduatedPools ? { pools: graduatedPools } : undefined,
          args: prev.args,
        };

        return next;
      }
    );
  });
  return null;
};
