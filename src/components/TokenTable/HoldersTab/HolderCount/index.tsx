import { useHolders, useTokenInfo } from '@/hooks/queries';
import { ReadableNumber } from '@/components/ui/ReadableNumber';

type HolderCountProps = Omit<React.ComponentPropsWithoutRef<typeof ReadableNumber>, 'num'>;

export const HolderCount: React.FC<HolderCountProps> = (props) => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);
  const { data: holders } = useHolders();

  const count = holders?.count ?? baseAsset?.holderCount;

  return <ReadableNumber num={count} format="compact" integer {...props} />;
};
