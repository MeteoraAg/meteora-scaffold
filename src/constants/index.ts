export const StorageKey = {
  INTEL_HUNT_FILTERS_CONFIG: 'intel_hunt_filters_config',
  INTEL_EXPLORE_PAGE_FILTERS_CONFIG: 'intel_explore_page_filters_config',
  INTEL_EXPLORE_FILTERS_CONFIG: 'intel_explore_filters_config',
} as const;
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];
