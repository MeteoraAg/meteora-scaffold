import { ColumnDef } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import Link from 'next/link';
import { useCallback } from 'react';

import { BottomPanelTab, bottomPanelTabAtom, traderAddressAtom } from '../../config';
import { HolderAddressTag } from '../HolderTag';
import { HolderInfo } from './utils';
import { formatReadablePercentChange } from '@/lib/format/number';
import { ReadableNumber } from '@/components/ui/ReadableNumber';
import { TraderAddress } from '../../TraderAddress';
import { TraderIndicators } from '../../TraderIndicators';

export const columns: ColumnDef<HolderInfo>[] = [
  {
    accessorKey: 'address',
    header: () => {
      return <div className="flex gap-x-1.5 rounded-md py-0.5 text-left">{`Address`}</div>;
    },
    cell: function Cell({ row }) {
      const setTraderAddress = useSetAtom(traderAddressAtom);
      const setBottomPanelTab = useSetAtom(bottomPanelTabAtom);

      const handleFilterTrader = useCallback(() => {
        setTraderAddress(row.original.address);
        setBottomPanelTab(BottomPanelTab.TXNS);
      }, [row.original.address, setBottomPanelTab, setTraderAddress]);

      return (
        <div className="flex items-center gap-x-1.5">
          <span className="text-xxs tabular-nums tracking-tighter text-neutral-600">
            #{row.original.index}
          </span>
          <div className="flex items-center">
            <button
              type="button"
              className="mr-1 flex items-center justify-center rounded p-0.5 text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary enabled:hover:text-neutral-300"
              onClick={handleFilterTrader}
            >
              <span className="iconify ph--funnel-bold" />
            </button>
            <Link
              href={`/portfolio/${row.original.address}`}
              target="_blank"
              prefetch={false}
              className="group-hover/row:underline"
            >
              <TraderAddress
                variant="regular"
                chars={4}
                address={row.original.address}
                className="flex-row-reverse text-left"
              />
            </Link>
            <HolderAddressTag address={row.original.address} tags={row.original.tags} />
            <TraderIndicators address={row.original.address} className="pl-1" />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'percentage',
    size: 50,
    header: () => <div className="text-right">{`% Owned`}</div>,
    cell: ({ row }) => {
      return (
        <div className="truncate text-right font-medium">
          {formatReadablePercentChange(
            row.original.percentage === undefined ? undefined : row.original.percentage / 100,
            { hideSign: 'positive' }
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">{`Amount`}</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <ReadableNumber
            className="truncate text-right font-medium"
            num={row.original.amount}
            format="compact"
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'balance',
    header: () => <div className="text-right">{`Balance`}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.original.balance?.toString() ?? '0');

      return (
        <div className="mt-1 flex h-full flex-col justify-center text-right font-medium">
          <ReadableNumber className="block" num={amount} format="compact" prefix="$" />
          <ReadableNumber
            className="block text-right text-neutral-600 lg:hidden"
            num={row.original.amount}
            format="compact"
          />
        </div>
      );
    },
  },
];
