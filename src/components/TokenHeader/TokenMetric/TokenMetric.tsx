import { cn } from '@/lib/utils';
import { ReadableNumber } from '@/components/ui/ReadableNumber';
import { useTokenInfo } from '@/hooks/queries';
import React from 'react';

type TokenMetricProps = {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  className?: string;
} & (
  | React.ComponentPropsWithoutRef<typeof ReadableNumber>
  | {
      children: React.ReactNode;
    }
);

export const TokenMetric: React.FC<TokenMetricProps> = ({
  label,
  className,
  children,
  ...props
}) => {
  return (
    <div className={className}>
      <div className="truncate text-xs leading-none text-neutral-500">{label}</div>
      {children !== undefined ? (
        children
      ) : (
        <ReadableNumber className="font-medium tabular-nums" format="compact" animated {...props} />
      )}
    </div>
  );
};

export const MetricPrice: React.FC = () => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);

  return <TokenMetric label="Price" num={baseAsset?.usdPrice} prefix="$" />;
};

export const MetricMcap: React.FC<{ className?: string }> = ({ className }) => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);

  return (
    <TokenMetric
      className={cn('flex py-3 items-center justify-between', className)}
      label="Mkt Cap"
      num={baseAsset?.mcap}
      prefix="$"
    />
  );
};

export const MetricFdv: React.FC<{ className?: string }> = ({ className }) => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);

  return (
    <TokenMetric
      className={cn('flex py-3 items-center justify-between', className)}
      label="FDV"
      num={baseAsset?.fdv}
      prefix="$"
    />
  );
};

export const MetricLiquidity: React.FC<{ className?: string }> = ({ className }) => {
  const { data } = useTokenInfo();

  return (
    <TokenMetric
      className={cn('flex py-3 items-center justify-between', className)}
      label="Liquidity"
      num={data?.baseAsset.liquidity}
      prefix="$"
    />
  );
};

export const MetricHolders: React.FC<{ className?: string }> = ({ className }) => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);

  return (
    <TokenMetric
      className={cn('flex py-3 items-center justify-between', className)}
      label="Holders"
      num={baseAsset?.holderCount ?? 0}
      integer
    />
  );
};
