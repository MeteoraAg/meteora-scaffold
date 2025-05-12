import React, { useMemo } from 'react';
import { HoverPopover } from '../ui/HoverPopover';
import { Pool } from '../Explore/types';
import { cn } from '@/lib/utils';
import { isAuditTopHoldersPass } from '../Explore/pool-utils';
import { getNumberColorCn } from '../ui/ReadableNumber';
import { ReadableNumber } from '../ui/ReadableNumber';
import { formatReadablePercentChange } from '@/lib/format/number';

type MetricProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  tooltip: string;
  className?: string;
};

export const Metric: React.FC<MetricProps> = ({ label, children, tooltip, className }) => (
  <HoverPopover content={tooltip} asChild>
    <button className={cn('z-[1] flex items-center gap-0.5 text-neutral-500', className)}>
      {label}
      {children}
    </button>
  </HoverPopover>
);

type TokenCardTopHoldersMetricProps = {
  audit: Pool['baseAsset']['audit'];
};

export const TokenCardTopHoldersMetric: React.FC<TokenCardTopHoldersMetricProps> = ({ audit }) => {
  const topHoldersPercentage = audit?.topHoldersPercentage;
  const isPass = isAuditTopHoldersPass(audit);

  return (
    <Metric label={<div className="mr-px text-neutral-500">T10</div>} tooltip="Top 10 Holders">
      <span
        className={cn(
          'opacity-80',
          topHoldersPercentage === undefined
            ? 'text-neutral-600'
            : isPass
              ? 'text-emerald'
              : 'text-rose'
        )}
      >
        {formatReadablePercentChange(
          topHoldersPercentage === undefined ? undefined : topHoldersPercentage / 100,
          {
            hideSign: 'positive',
            decimals: 0,
          }
        )}
      </span>
    </Metric>
  );
};

type TokenCardNetVolumeMetricProps = {
  buyVolume: number | undefined;
  sellVolume: number | undefined;
};

export const TokenCardNetVolumeMetric: React.FC<TokenCardNetVolumeMetricProps> = ({
  buyVolume,
  sellVolume,
}) => {
  const netVolume =
    buyVolume === undefined && sellVolume === undefined
      ? undefined
      : (buyVolume ?? 0) - (sellVolume ?? 0);

  return (
    <Metric
      label={
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-neutral-800 text-center text-[8px] font-semibold leading-none text-neutral-500">
          NV
        </div>
      }
      tooltip="Net Volume"
    >
      <ReadableNumber
        className={cn('opacity-80', getNumberColorCn(netVolume))}
        format="compact"
        num={netVolume ? Math.abs(netVolume) : undefined}
        prefix="$"
      />
    </Metric>
  );
};

type TokenCardNetBuyersMetricProps = {
  numNetBuyers: number | undefined;
  numTraders: number | undefined;
};

export const TokenCardNetBuyersMetric: React.FC<TokenCardNetBuyersMetricProps> = ({
  numNetBuyers,
  numTraders,
}) => {
  const isNetBuyersDominant =
    numNetBuyers === undefined || numTraders === undefined || numTraders === 0
      ? undefined
      : numNetBuyers / numTraders >= 0.5;

  return (
    <Metric
      label={
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-neutral-800 text-center text-[8px] font-semibold leading-none text-neutral-500">
          NB
        </div>
      }
      tooltip="Net Buyers"
    >
      <ReadableNumber
        className={cn(
          'opacity-80',
          getNumberColorCn(
            isNetBuyersDominant === undefined ? undefined : isNetBuyersDominant ? 1 : -1
          )
        )}
        format="compact"
        num={numNetBuyers}
        integer
        color
      />
    </Metric>
  );
};

type TokenCardHoldersMetricProps = {
  holderCount: number | undefined;
};

export const TokenCardHoldersMetric: React.FC<TokenCardHoldersMetricProps> = ({ holderCount }) => {
  return (
    <Metric label={<span className="iconify ic--round-people-alt">H</span>} tooltip="Holders">
      <ReadableNumber format="compact" className="text-neutral-400" num={holderCount} integer />
    </Metric>
  );
};

type TokenCardVolumeMetricProps = {
  buyVolume: number | undefined;
  sellVolume: number | undefined;
};

export const TokenCardVolumeMetric: React.FC<TokenCardVolumeMetricProps> = ({
  buyVolume,
  sellVolume,
}) => {
  const volume =
    buyVolume === undefined && sellVolume === undefined
      ? undefined
      : (buyVolume ?? 0) + (sellVolume ?? 0);

  const isAboveThreshold = useMemo(() => volume && volume >= 500_000, [volume]);

  return (
    <Metric label="V" tooltip="Volume" className="text-sm">
      <ReadableNumber
        format="compact"
        className={cn('font-medium text-neutral-300', isAboveThreshold && 'text-yellow-200')}
        num={volume}
        prefix="$"
      />
    </Metric>
  );
};

// Market Cap
type TokenCardMcapMetricProps = {
  mcap: number | undefined;
};

export const TokenCardMcapMetric: React.FC<TokenCardMcapMetricProps> = ({ mcap }) => {
  const isAboveThreshold = useMemo(() => mcap && mcap >= 250_000, [mcap]);

  return (
    <Metric label="MC" tooltip="Market Cap" className="text-sm">
      <ReadableNumber
        format="compact"
        className={cn('font-medium text-neutral-300', isAboveThreshold && 'text-yellow-200')}
        num={mcap}
        prefix="$"
      />
    </Metric>
  );
};

// Liquidity
type TokenCardLiquidityMetricProps = {
  liquidity: number | undefined;
};

export const TokenCardLiquidityMetric: React.FC<TokenCardLiquidityMetricProps> = ({
  liquidity,
}) => {
  return (
    <Metric label="L" tooltip="Liquidity">
      <ReadableNumber
        format="compact"
        className="font-medium text-neutral-400"
        num={liquidity}
        prefix="$"
      />
    </Metric>
  );
};
