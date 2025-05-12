import { useTokenAddress } from '@/hooks/queries';
import { TokenDescription } from './TokenDescription';
import { BondingCurve } from './BondingCurve';

import { TokenMetrics } from './TokenMetrics';
import { Checklist } from './TokenChecklist';

export const TokenDetails: React.FC = () => {
  const tokenId = useTokenAddress();

  return (
    <div className="overflow-y-auto flex flex-col gap-y-4">
      <TokenMetrics key={`token-metrics-${tokenId}`} />
      <BondingCurve key={`bonding-curve-${tokenId}`} className="px-2.5" />

      <div className="flex flex-col divide-y divide-neutral-850 border-neutral-850">
        <TokenDescription />
        <Checklist />
      </div>
    </div>
  );
};
