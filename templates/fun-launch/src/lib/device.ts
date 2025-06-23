import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export function isHoverableDevice(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

// Breakpoints
const BREAKPOINTS = { xl: 1280, lg: 1024, md: 768, sm: 640, xs: 0 } as const;
type Breakpoint = keyof typeof BREAKPOINTS;

// Sort breakpoints from largest to smallest
const SORTED_BREAKPOINTS = Object.entries(BREAKPOINTS).sort((a, b) => b[1] - a[1]) as [
  Breakpoint,
  number,
][];

/**
 * The current window width
 */
const windowWidthAtom = atom(typeof window !== 'undefined' ? window.innerWidth : 0);

/**
 * The current breakpoint
 */
const breakpointAtom = atom<Breakpoint>((get) => {
  const width = get(windowWidthAtom);

  for (const [name, breakpoint] of SORTED_BREAKPOINTS) {
    if (width >= breakpoint) {
      return name as Breakpoint;
    }
  }

  return 'xs';
});

export const useBreakpoint = () => useAtomValue(breakpointAtom);

export function useWindowWidthListener(): void {
  const setWindowWidth = useSetAtom(windowWidthAtom);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update initial width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setWindowWidth]);
}

/**
 * Map of all breakpoints with boolean values indicating if the current width is >= that breakpoint
 */
type BreakpointMatches = {
  [K in Breakpoint]: boolean;
};

const breakpointMatchesAtom = atom<BreakpointMatches>((get) => {
  // Derive from breakpoint atom instead of window width
  // This is more efficient as it avoids re-renders when width changes
  const currentBreakpoint = get(breakpointAtom);

  // Current breakpoint index
  const currentIndex = SORTED_BREAKPOINTS.findIndex(([bp]) => bp === currentBreakpoint);

  // If position is less (larger) than current, the breakpoint is true
  const result = {} as BreakpointMatches;
  for (let i = 0; i < SORTED_BREAKPOINTS.length; i++) {
    const [breakpoint] = SORTED_BREAKPOINTS[i];
    result[breakpoint] = i >= currentIndex;
  }

  return result;
});

export const useBreakpointMatches = () => useAtomValue(breakpointMatchesAtom);
