import { memo } from 'react';
import { MetricFdv, MetricLiquidity, MetricMcap } from './TokenMetric/TokenMetric';
import { cn } from '@/lib/utils';

type TokenMetricsProps = {
  className?: string;
};

export const TokenMetrics: React.FC<TokenMetricsProps> = memo(({ className }) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <MetricMcap className="text-sm border border-neutral-700 px-2 rounded-lg" />
      <MetricFdv className="text-sm border border-neutral-700 px-2 rounded-lg" />
      <MetricLiquidity className="text-sm border border-neutral-700 px-2 rounded-lg" />
    </div>
  );
});

TokenMetrics.displayName = 'TokenMetrics';
