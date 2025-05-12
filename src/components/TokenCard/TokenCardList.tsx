import { QueryStatus } from '@tanstack/react-query';
import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';

import { Pool, TokenListTimeframe } from '../Explore/types';
import { useDataStream } from '@/contexts/DataStreamProvider';
import { cn } from '@/lib/utils';
import { TokenCard } from './TokenCard';
import { TokenCardSkeleton } from './TokenCard';

const ROWS_OVERSCAN = 0;
const ROW_HEIGHT_ESTIMATE = 90; // px for cards
const SKELETON_COUNT = 5;

type TokenCardListProps = React.ComponentPropsWithoutRef<'div'> & {
  data?: Pool[];
  status: QueryStatus;
  timeframe: TokenListTimeframe;
  trackPools?: boolean;
  emptyState?: React.ReactNode;
};

export const TokenCardList = memo(
  forwardRef<HTMLDivElement, TokenCardListProps>(
    ({ timeframe, data, status, trackPools, emptyState, className, ...props }, ref) => {
      const [visiblePoolIds, setVisiblePoolIds] = useState<Set<string>>(() => new Set());
      const poolElements = useRef(new Map<string, Element>());
      const observer = useRef<IntersectionObserver | undefined>(undefined);

      useEffect(() => {
        const newObserver = new IntersectionObserver(
          (entries) => {
            setVisiblePoolIds((prev) => {
              const next = new Set(prev);
              entries.forEach((entry) => {
                const poolId = (entry.target as HTMLElement).dataset.poolId;
                if (!poolId) return;

                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                entry.isIntersecting ? next.add(poolId) : next.delete(poolId);
              });
              return next;
            });
          },
          {
            rootMargin: `${ROW_HEIGHT_ESTIMATE * ROWS_OVERSCAN}px`,
            threshold: 0.1,
          }
        );
        observer.current = newObserver;

        return () => newObserver.disconnect();
      }, []);

      const rowRef = useCallback((element: HTMLElement | null, poolId: string) => {
        if (!element) {
          poolElements.current.delete(poolId);
          return;
        }

        poolElements.current.set(poolId, element);
        observer.current?.observe(element);
      }, []);

      const { subscribePools, unsubscribePools } = useDataStream();
      useEffect(() => {
        if (!trackPools) return;

        const poolIds = Array.from(visiblePoolIds);
        if (!poolIds.length) return;
        subscribePools(poolIds);
        return () => unsubscribePools(poolIds);
      }, [trackPools, visiblePoolIds, subscribePools, unsubscribePools]);

      return (
        <div
          ref={ref}
          className={cn('relative flex flex-col overflow-y-auto', className)}
          {...props}
        >
          {status === 'loading' ? (
            new Array(SKELETON_COUNT).fill(0).map((_, i) => (
              <TokenCardSkeleton
                key={`skeleton-${i}`}
                style={{
                  opacity: Math.max(0, 1 - i / SKELETON_COUNT),
                }}
              />
            ))
          ) : !data || data.length === 0 ? (
            (emptyState ?? (
              <div className="col-span-full py-12 text-center">
                <div className="text-neutral-500">No tokens matching this criteria</div>
                <div className="text-neutral-600">Adjust filters!</div>
              </div>
            ))
          ) : (
            <>
              {data.map((pool) => (
                <TokenCard
                  key={pool.baseAsset.id}
                  pool={pool}
                  timeframe={timeframe}
                  rowRef={rowRef}
                />
              ))}
            </>
          )}
        </div>
      );
    }
  )
);
