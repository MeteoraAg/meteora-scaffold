import { ApeQueries, GemsTokenListQueryArgs, QueryData } from '@/components/Explore/queries';
import { TokenListTimeframe } from '@/components/Explore/types';
import { useExplore } from '@/contexts/ExploreProvider';
import { useQuery } from '@tanstack/react-query';

export function useExploreGemsTokenList<T = QueryData<typeof ApeQueries.gemsTokenList>>(
  select?: (data: QueryData<typeof ApeQueries.gemsTokenList>) => T
) {
  const { request } = useExplore();

  return useQuery({
    ...ApeQueries.gemsTokenList(request),
    select,
    refetchInterval: 30 * 1000,
    // TODO: set time, we dont want to keep inactive tabs in cache at all
  });
}
