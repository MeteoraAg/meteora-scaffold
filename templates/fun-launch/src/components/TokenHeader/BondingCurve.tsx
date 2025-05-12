import { useTokenInfo } from '@/hooks/queries';
import { formatReadablePercentChange } from '@/lib/format/number';
import { cn } from '@/lib/utils';

type BondingCurveProps = {
  className?: string;
};

export const BondingCurve: React.FC<BondingCurveProps> = ({ className }) => {
  const { data: bondingCurve } = useTokenInfo((data) => data?.bondingCurve);
  if (bondingCurve === undefined || bondingCurve >= 100) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        Bonding Curve:
        <span>{formatReadablePercentChange(bondingCurve / 100, { hideSign: 'positive' })}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-850">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${bondingCurve}%` }}
        />
      </div>
    </div>
  );
};

export const MobileBondingCurve: React.FC<BondingCurveProps> = ({ className }) => {
  const { data: bondingCurve } = useTokenInfo((data) => data?.bondingCurve);
  if (bondingCurve === undefined || bondingCurve >= 100) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-1 pt-2', className)}>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        Bonding Curve:
        <span>{formatReadablePercentChange(bondingCurve / 100, { hideSign: 'positive' })}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-850">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${bondingCurve}%` }}
        />
      </div>
    </div>
  );
};
