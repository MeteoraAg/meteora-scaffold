import { Holder } from '@/components/Explore/types';

export type HolderInfo = Holder & {
  index: number;
  percentage?: number | undefined;
  balance?: number | undefined;
};
