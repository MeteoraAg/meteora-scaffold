import { ExploreTab } from '@/components/Explore/types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useLocalStorage } from 'react-use';

import { TokenListFilters } from '@/components/Explore/types';
import { TokenListTimeframe } from '@/components/Explore/types';
import { GemsTokenListQueryArgs } from '@/components/Explore/queries';
import { StorageKey } from '@/constants';

export const EXPLORE_FIXED_TIMEFRAME: TokenListTimeframe = '24h';
const DEFAULT_TAB: ExploreTab = ExploreTab.NEW;

type FiltersConfig = {
  [tab in ExploreTab]?: TokenListFilters;
};

type ExploreContextType = {
  mobileTab: ExploreTab;
  setMobileTab: (tab: ExploreTab) => void;
  filters?: FiltersConfig;
  setFilters: (tab: ExploreTab, filters: TokenListFilters) => void;
  request: Required<GemsTokenListQueryArgs>;
  pausedTabs: Record<ExploreTab, boolean>;
  setTabPaused: (tab: ExploreTab, isPaused: boolean) => void;
};

const ExploreContext = createContext<ExploreContextType>({
  mobileTab: DEFAULT_TAB,
  setMobileTab: () => {},
  filters: undefined,
  setFilters: () => {},
  request: {
    [ExploreTab.NEW]: {
      timeframe: EXPLORE_FIXED_TIMEFRAME,
    },
    [ExploreTab.GRADUATING]: {
      timeframe: EXPLORE_FIXED_TIMEFRAME,
    },
    [ExploreTab.GRADUATED]: {
      timeframe: EXPLORE_FIXED_TIMEFRAME,
    },
  },
  pausedTabs: {
    [ExploreTab.NEW]: false,
    [ExploreTab.GRADUATING]: false,
    [ExploreTab.GRADUATED]: false,
  },
  setTabPaused: () => {},
});

const ExploreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const partnerConfigs = useMemo(
    () => process.env.NEXT_PUBLIC_POOL_CONFIG_KEY?.split(',') || [],
    []
  );

  const [mobileTab, setMobileTab] = useState<ExploreTab>(DEFAULT_TAB);
  const [pausedTabs, setPausedTabs] = useState<Record<ExploreTab, boolean>>({
    [ExploreTab.NEW]: false,
    [ExploreTab.GRADUATING]: false,
    [ExploreTab.GRADUATED]: false,
  });

  // Store all filters in an object to avoid tab -> filter state sync issues
  const [filtersConfig, setFiltersConfig] = useLocalStorage<FiltersConfig>(
    StorageKey.INTEL_EXPLORER_FILTERS_CONFIG,
    {}
  );

  const setFilters = useCallback(
    (tab: ExploreTab, newFilters: TokenListFilters) => {
      setFiltersConfig({
        ...filtersConfig,
        [tab]: newFilters,
      });
    },
    [setFiltersConfig, filtersConfig]
  );

  const setTabPaused = useCallback((tab: ExploreTab, isPaused: boolean) => {
    setPausedTabs((prev) => ({
      ...prev,
      [tab]: isPaused,
    }));
  }, []);

  const request = useMemo(() => {
    return Object.fromEntries(
      Object.values(ExploreTab).map((tab) => [
        tab,
        {
          timeframe: EXPLORE_FIXED_TIMEFRAME,
          filters: {
            ...filtersConfig?.[tab],
            partnerConfigs,
          },
        },
      ])
    ) as Required<GemsTokenListQueryArgs>;
  }, [filtersConfig, partnerConfigs]);

  return (
    <ExploreContext.Provider
      value={{
        mobileTab,
        setMobileTab,
        filters: filtersConfig,
        setFilters,
        request,
        pausedTabs,
        setTabPaused,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
};

const useExplore = () => {
  const ctx = useContext(ExploreContext);
  if (!ctx) {
    throw new Error('useExplore must be used within ExploreProvider');
  }
  return ctx;
};

export { ExploreProvider, useExplore };
