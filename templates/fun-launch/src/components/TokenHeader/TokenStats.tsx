import { useTokenInfo } from '@/hooks/queries';
import { formatReadablePercentChange } from '@/lib/format/number';
import { cn } from '@/lib/utils';
import React, { memo, useState } from 'react';
import { getNumberColorCn } from '../ui/ReadableNumber';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';

type TokenStatsProps = {
  className?: string;
};

export const TokenStatsTimeframe = {
  MIN_5: '5m',
  HOUR_1: '1h',
  HOUR_6: '6h',
  HOUR_24: '24h',
} as const;
export type TokenStatsTimeframe = (typeof TokenStatsTimeframe)[keyof typeof TokenStatsTimeframe];

export const DEFAULT_TIMEFRAME: TokenStatsTimeframe = TokenStatsTimeframe.HOUR_24;

export const TokenStats: React.FC<TokenStatsProps> = memo(({ className }) => {
  const [timeframe, setTimeframe] = useState<TokenStatsTimeframe>(DEFAULT_TIMEFRAME);

  return (
    <ToggleGroupPrimitive.Root
      className={className}
      type="single"
      defaultValue={DEFAULT_TIMEFRAME}
      value={timeframe}
      onValueChange={(value) => {
        if (value) {
          setTimeframe(value as TokenStatsTimeframe);
        }
      }}
    >
      <div
        className={cn(
          'overflow-y-none grid grid-cols-4 divide-x divide-neutral-850 overflow-x-auto border border-neutral-850 text-xs rounded-t-lg'
        )}
      >
        <ToggleGroupItem value={TokenStatsTimeframe.MIN_5} />
        <ToggleGroupItem value={TokenStatsTimeframe.HOUR_1} />
        <ToggleGroupItem value={TokenStatsTimeframe.HOUR_6} />
        <ToggleGroupItem value={TokenStatsTimeframe.HOUR_24} />
      </div>
    </ToggleGroupPrimitive.Root>
  );
});

TokenStats.displayName = 'TokenStats';

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, 'children'> & {
    value: TokenStatsTimeframe;
  }
>(({ className, value, ...props }, ref) => {
  const { data: stats } = useTokenInfo((data) => data?.baseAsset[`stats${value}`]);

  const priceChange = stats?.priceChange === undefined ? undefined : stats.priceChange / 100;

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center whitespace-nowrap p-1.5 text-neutral-500 transition-all',
        'data-[state=off]:hover:bg-neutral-925 data-[state=off]:hover:text-neutral-300',
        'data-[state=on]:bg-neutral-900',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      value={value}
      {...props}
    >
      <span>{value}</span>
      <div className={cn('font-medium', getNumberColorCn(priceChange))}>
        {formatReadablePercentChange(priceChange, { hideSign: 'positive' })}
      </div>
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
