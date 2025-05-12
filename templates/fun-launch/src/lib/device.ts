import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export function isHoverableDevice(): boolean {
  if (typeof window === 'undefined') return false;
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

// Start with a default value of 0 for both server and client to avoid hydration mismatch
const windowWidthAtom = atom(0);

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

    // Update initial width - only after the component is mounted on the client
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
