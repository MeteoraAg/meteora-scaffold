import React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { useExplore } from '@/contexts/ExploreProvider';
import { HuntTab } from './types';
import { PausedIndicator } from './PausedIndicator';
import { cn } from '@/lib/utils';

export const HuntTabTitleMap: Record<HuntTab, string> = {
  [HuntTab.NEW]: `New`,
  [HuntTab.GRADUATING]: `Soon`,
  [HuntTab.GRADUATED]: `Bonded`,
};

export const MobileHuntTabs = () => {
  const { mobileTab, setMobileTab, pausedTabs } = useExplore();
  return (
    <div className="sticky inset-x-0 top-0 z-20 border-b border-neutral-850 shadow-md shadow-neutral-950 lg:hidden bg-black">
      <div className="px-2 py-1">
        <ToggleGroupPrimitive.Root
          className="flex h-9 w-full min-w-fit items-center gap-1 text-sm"
          type="single"
          value={mobileTab}
          onValueChange={(value) => {
            if (value) {
              setMobileTab(value as HuntTab);
            }
          }}
        >
          <ToggleGroupItem value={HuntTab.NEW}>
            {HuntTabTitleMap[HuntTab.NEW]}
            {mobileTab === HuntTab.NEW && pausedTabs[HuntTab.NEW] && <PausedIndicator />}
          </ToggleGroupItem>
          <ToggleGroupItem value={HuntTab.GRADUATING}>
            {HuntTabTitleMap[HuntTab.GRADUATING]}
            {mobileTab === HuntTab.GRADUATING && pausedTabs[HuntTab.GRADUATING] && (
              <PausedIndicator />
            )}
          </ToggleGroupItem>
          <ToggleGroupItem value={HuntTab.GRADUATED}>
            {HuntTabTitleMap[HuntTab.GRADUATED]}
            {mobileTab === HuntTab.GRADUATED && pausedTabs[HuntTab.GRADUATED] && (
              <PausedIndicator />
            )}
          </ToggleGroupItem>
          {/* <MobileHuntFiltersControl /> */}
        </ToggleGroupPrimitive.Root>
      </div>
    </div>
  );
};

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg px-3 text-neutral-400 transition-all',
        'data-[state=off]:hover:text-primary/80',
        'data-[state=on]:bg-primary/10 data-[state=on]:text-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
        className
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
