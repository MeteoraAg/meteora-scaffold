import { useTokenInfo } from '@/hooks/queries';
import { useWallet } from '@jup-ag/wallet-adapter';
import { TruncatedAddress } from '../TruncatedAddress/TruncatedAddress';
import { cn } from '@/lib/utils';
import { useBreakpointMatches } from '@/lib/device';

const BASE_CHARS = 3;

type TraderAddressProps = {
  className?: string;
  address: string;
  /**
   * @default 'auto'
   * - 'short': hide start chars
   * - 'auto': hide start chars on mobile
   */
  variant?: 'auto' | 'short' | 'regular';
  chars?: number;
};

export const TraderAddress: React.FC<TraderAddressProps> = ({
  address,
  variant = 'auto',
  chars = BASE_CHARS,
  className,
}) => {
  const { data: poolId } = useTokenInfo((pool) => pool.id);
  const bp = useBreakpointMatches();

  if (address === poolId) {
    return <span>POOL</span>;
  }

  const charsStart = variant === 'short' ? 0 : variant === 'regular' ? chars : bp.sm ? chars : 0;

  return (
    <TruncatedAddress
      className={cn('max-w-[12ch] truncate text-right font-medium', className)}
      address={address}
      charsStart={charsStart}
      charsEnd={BASE_CHARS}
    />
  );
};
