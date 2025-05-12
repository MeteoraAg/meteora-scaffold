import { HuntTab } from '@/components/Explore/types';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useLocalStorage } from 'react-use';

import { TokenListFilters } from '@/components/Explore/types';
import { TokenListTimeframe } from '@/components/Explore/types';
import { GemsTokenListQueryArgs } from '@/components/Explore/queries';
import { StorageKey } from '@/constants';

export const HUNT_FIXED_TIMEFRAME: TokenListTimeframe = '24h';
const DEFAULT_TAB: HuntTab = HuntTab.NEW;

type FiltersConfig = {
  [tab in HuntTab]?: TokenListFilters;
};

type ExploreContextType = {
  mobileTab: HuntTab;
  setMobileTab: (tab: HuntTab) => void;
  filters?: FiltersConfig;
  setFilters: (tab: HuntTab, filters: TokenListFilters) => void;
  request: Required<GemsTokenListQueryArgs>;
  pausedTabs: Record<HuntTab, boolean>;
  setTabPaused: (tab: HuntTab, isPaused: boolean) => void;
};

const ExploreContext = createContext<ExploreContextType>({
  mobileTab: DEFAULT_TAB,
  setMobileTab: () => {},
  filters: undefined,
  setFilters: () => {},
  request: {
    [HuntTab.NEW]: {
      timeframe: HUNT_FIXED_TIMEFRAME,
    },
    [HuntTab.GRADUATING]: {
      timeframe: HUNT_FIXED_TIMEFRAME,
    },
    [HuntTab.GRADUATED]: {
      timeframe: HUNT_FIXED_TIMEFRAME,
    },
  },
  pausedTabs: {
    [HuntTab.NEW]: false,
    [HuntTab.GRADUATING]: false,
    [HuntTab.GRADUATED]: false,
  },
  setTabPaused: () => {},
});

const ExploreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const partnerConfigs = useMemo(
    () => process.env.NEXT_PUBLIC_PARTNER_CONFIGS?.split(',') || [],
    []
  );

  const [mobileTab, setMobileTab] = useState<HuntTab>(DEFAULT_TAB);
  const [pausedTabs, setPausedTabs] = useState<Record<HuntTab, boolean>>({
    [HuntTab.NEW]: false,
    [HuntTab.GRADUATING]: false,
    [HuntTab.GRADUATED]: false,
  });

  // Store all filters in an object to avoid tab -> filter state sync issues
  const [filtersConfig, setFiltersConfig] = useLocalStorage<FiltersConfig>(
    StorageKey.INTEL_HUNT_FILTERS_CONFIG,
    {}
  );

  const setFilters = useCallback(
    (tab: HuntTab, newFilters: TokenListFilters) => {
      setFiltersConfig({
        ...filtersConfig,
        [tab]: newFilters,
      });
    },
    [setFiltersConfig, filtersConfig]
  );

  const setTabPaused = useCallback((tab: HuntTab, isPaused: boolean) => {
    setPausedTabs((prev) => ({
      ...prev,
      [tab]: isPaused,
    }));
  }, []);

  const request = useMemo(() => {
    return Object.fromEntries(
      Object.values(HuntTab).map((tab) => [
        tab,
        {
          timeframe: HUNT_FIXED_TIMEFRAME,
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
    throw new Error('useHunt must be used within ExploreProvider');
  }
  return ctx;
};

export { ExploreProvider, useExplore };
