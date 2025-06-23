import { atom, useAtom } from 'jotai';

import { HolderTable } from '../HoldersTable';
import { columns } from '../HoldersTable/columns';
import { HolderInfo } from '../HoldersTable/utils';
import { useHolders, useTokenInfo } from '@/hooks/queries';

export const HolderContentTable: React.FC = () => {
  const { data: baseAsset } = useTokenInfo((data) => data?.baseAsset);
  const { data } = useHolders();

  const infos = data?.holders?.map((holder, i) => {
    const balance = baseAsset?.usdPrice ? holder.amount * baseAsset?.usdPrice : undefined;
    const percentage = baseAsset?.totalSupply
      ? (holder.amount / baseAsset?.totalSupply) * 100
      : undefined;
    return {
      ...holder,
      index: i + 1,
      balance,
      percentage,
    } as HolderInfo;
  });
  return <HolderTable data={infos} columns={columns} />;
};
