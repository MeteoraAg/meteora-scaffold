import React from 'react';
import { useTokenInfo } from '@/hooks/queries';
import { cn } from '@/lib/utils';
import { formatReadablePercentChange } from '@/lib/format/number';
import { isAuditTopHoldersPass } from '@/components/Explore/pool-utils';

export const TopHolderCount: React.FC = () => {
  const { data: audit } = useTokenInfo((data) => data?.baseAsset.audit);

  return (
    <span
      className={cn(
        audit?.topHoldersPercentage === undefined
          ? 'text-neutral-500'
          : isAuditTopHoldersPass(audit)
            ? 'text-emerald'
            : 'text-rose'
      )}
    >
      {formatReadablePercentChange(
        audit?.topHoldersPercentage === undefined ? undefined : audit?.topHoldersPercentage / 100,
        { hideSign: 'positive' }
      )}
    </span>
  );
};
