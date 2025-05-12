import { ApeClient } from '@/components/Explore/client';
import {
  CategoryTokenList,
  GetGemsTokenListRequest,
  GetTxsResponse,
  ResolvedTokenListFilters,
  TokenListFilters,
  TokenListSortBy,
  TokenListSortByField,
  TokenListSortDir,
  TokenListTimeframe,
  resolveTokenListFilters,
} from './types';

export type QueryData<T> = T extends (...args: infer OptionsArgs) => {
  queryFn: (...args: infer Args) => Promise<infer R>;
}
  ? R
  : never;

export type RecentTokenListQueryArgs = {
  createdAt: Date;
  sortBy: TokenListSortBy;
  sortDir: TokenListSortDir;
  timeframe: TokenListTimeframe;
  filters?: ResolvedTokenListFilters;
};

export type TokenListQueryArgs = {
  category: CategoryTokenList;
  timeframe: TokenListTimeframe;
  sortBy?: TokenListSortByField;
  sortDir?: TokenListSortDir;
  filters?: TokenListFilters;
};

export type GemsTokenListQueryArgs = {
  [list in keyof GetGemsTokenListRequest]: {
    timeframe: TokenListTimeframe;
    filters?: TokenListFilters;
  };
};

// TODO: upgrade to `queryOptions` helper in react query v5
// TODO: move this to a centralised file close to the `useQuery` hooks these are called in

// We include args in the query fn return so know args when mutating queries
export const ApeQueries = {
  gemsTokenList: (args: GemsTokenListQueryArgs) => {
    const req = {
      recent: args.recent
        ? {
            timeframe: args.recent.timeframe,
            ...resolveTokenListFilters(args.recent.filters),
          }
        : undefined,
      graduated: args.graduated
        ? {
            timeframe: args.graduated.timeframe,
            ...resolveTokenListFilters(args.graduated.filters),
          }
        : undefined,
      aboutToGraduate: args.aboutToGraduate
        ? {
            timeframe: args.aboutToGraduate.timeframe,
            ...resolveTokenListFilters(args.aboutToGraduate.filters),
          }
        : undefined,
    };

    return {
      queryKey: ['explore', 'gems', args],
      queryFn: async () => {
        const res = await ApeClient.getGemsTokenList(req);
        return Object.assign(res, { args });
      },
    };
  },
  tokenInfo: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'info'],
      queryFn: async () => {
        const info = await ApeClient.getToken({ id: args.id });
        if (!info?.pools[0]) {
          throw new Error('No token info found');
        }
        return info?.pools[0];
      },
    };
  },
  tokenDescription: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'description'],
      queryFn: async () => {
        const res = await ApeClient.getTokenDescription(args.id);
        return res;
      },
    };
  },
  tokenTxs: (args: { id: string }) => {
    return {
      queryKey: ['explore', 'token', args.id, 'txs'],
      queryFn: async ({ signal, pageParam }: any) => {
        const res = await ApeClient.getTokenTxs(
          args.id,
          pageParam
            ? {
                ...pageParam,
              }
            : {},
          { signal }
        );
        return Object.assign(res, {
          args,
        });
      },
      // This gets passed as `pageParam`
      getNextPageParam: (lastPage: GetTxsResponse) => {
        // TODO: update to use BE api response when its returned
        if (lastPage?.txs.length === 0) {
          return;
        }
        const lastTs = lastPage?.txs[lastPage?.txs.length - 1].timestamp;
        return {
          offset: lastPage?.next,
          offsetTs: lastTs,
        };
      },
    };
  },
};
