import React from 'react';
import { DevIndicator } from './DevIndicator';
import { PoolIndicator } from './PoolIndicator';
import { useTokenInfo } from '@/hooks/queries';
import { cn } from '@/lib/utils';

// Assumes you are in a token page

type TraderIndicatorsProps = {
  address: string;
  className?: string;
};

export const TraderIndicators: React.FC<TraderIndicatorsProps> = ({ address, className }) => {
  const { data } = useTokenInfo((pool) => {
    return {
      // useful addresses
      poolId: pool.id,
      bondingCurveId: pool.bondingCurveId,
      graduatedPoolId: pool.baseAsset.graduatedPool,
      devId: pool.baseAsset.dev,
    };
  });

  let isDev = false;
  let isPool = false;
  if (data) {
    isDev = address === data.devId;
    isPool =
      address === data.poolId ||
      address === data.graduatedPoolId ||
      address === data.bondingCurveId;
  }

  const hasIndicators = isDev || isPool;

  // No indicators
  if (!hasIndicators) {
    return null;
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      {isDev && <DevIndicator />}
      {isPool && <PoolIndicator />}
    </span>
  );
};
