import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

/**
 * The current date, updated every second
 *
 * @example
 * import { useAtomValue } from 'jotai';
 * import { nowAtom } from 'utils/environment/date';
 * const now = useAtomValue(nowAtom);
 */
const currentDateAtom = atom(new Date());

/**
 * The current date, updated every second
 */
export const useCurrentDate = () => useAtomValue(currentDateAtom);

/**
 * Hook to update atom every second
 */
export function useCurrentDateTicker(): void {
  const setNow = useSetAtom(currentDateAtom);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setNow]);
}
