import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const BottomPanelTab = {
  TXNS: 'token_txns',
  HOLDERS: 'token_holders',
  HISTORY: 'history',
  ORDERS: 'orders',
} as const;
export type BottomPanelTab = (typeof BottomPanelTab)[keyof typeof BottomPanelTab];

export const bottomPanelTabAtom = atomWithStorage<BottomPanelTab | undefined>(
  'INTEL_BOTTOM_PANEL_TAB',
  BottomPanelTab.TXNS,
  undefined,
  { getOnInit: true }
);

/**
 * Filtered trader address
 */
export const traderAddressAtom = atom<string | undefined>(undefined);
