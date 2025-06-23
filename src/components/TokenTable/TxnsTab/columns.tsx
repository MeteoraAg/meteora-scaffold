import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { ColumnDef } from '@tanstack/react-table';

import { DateMode } from './datemode';
import { Tx } from '../../Explore/types';
import { CurrentAge } from './CurrentAge';
import { Badge } from './Badge';
import { intlDate } from '@/lib/format/date';
import { ReadableNumber } from '../../ui/ReadableNumber';
import { TruncatedAddress } from '../../TruncatedAddress/TruncatedAddress';
import { ExternalLink } from '../../ui/ExternalLink';
import { TableCell } from '../../Table';
import { TableRow } from '../../Table';
import { Skeleton } from '../../ui/Skeleton';
import ExternalIcon from '@/icons/ExternalIcon';

export const columns: ColumnDef<Tx>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ table }) => {
      return (
        <ToggleGroupPrimitive.Root
          className="flex items-center gap-x-1"
          type="single"
          defaultValue={DateMode.AGE}
          value={table.options.meta?.dateMode}
          onValueChange={(value) => {
            if (value) {
              table.options.meta?.setDateMode(value as DateMode);
            }
          }}
        >
          <ToggleGroupPrimitive.ToggleGroupItem
            className="duration-150 data-[state=off]:text-neutral-600 data-[state=on]:text-neutral-400 data-[state=off]:hover:text-neutral-400"
            value={DateMode.DATE}
          >
            {`Date`}
          </ToggleGroupPrimitive.ToggleGroupItem>
          <span className="text-neutral-600">/</span>
          <ToggleGroupPrimitive.ToggleGroupItem
            className="duration-150 data-[state=off]:text-neutral-600 data-[state=on]:text-neutral-400 data-[state=off]:hover:text-neutral-400"
            value={DateMode.AGE}
          >
            {`Age`}
          </ToggleGroupPrimitive.ToggleGroupItem>
        </ToggleGroupPrimitive.Root>
      );
    },
    cell: ({ row, table }) => {
      return (
        <div className="flex items-center gap-x-1 truncate text-left font-medium" translate="no">
          <div>
            {table.options.meta?.dateMode === DateMode.DATE ? (
              intlDate.format(row.original.timestamp, { withoutYear: true, hour12: false })
            ) : (
              <CurrentAge date={new Date(row.original.timestamp)} />
            )}
          </div>
          <Badge
            variant={row.original.type === 'buy' ? 'green' : 'red'}
            className="w-fit lg:hidden"
          >
            {row.original.type === 'buy' ? 'B' : 'S'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    size: 50,
    header: () => <div className="text-center">{`Type`}</div>,
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.type === 'buy' ? 'green' : 'red'}
          className="text-right capitalize"
        >
          {row.original.type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'usdPrice',
    header: () => <div className="text-right">{`Price`}</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <ReadableNumber
            format="price"
            className="font-medium"
            num={row.original.usdPrice}
            prefix="$"
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'usdVolume',
    header: () => <div className="text-right">{`Volume`}</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('usdVolume'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'amount',
    header: ({ table }) => <div className="text-right">{table.options.meta?.symbol}</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <ReadableNumber format="compact" className="font-medium" num={row.original.amount} />
        </div>
      );
    },
  },
  {
    accessorKey: 'traderAddress',
    header: () => <div className="text-right">{`Trader`}</div>,
    cell: ({ row, table }) => {
      return (
        <div className="flex items-center justify-end gap-x-1.5 text-right text-neutral-400">
          <div className="flex items-center gap-x-1">
            {row.original.traderAddress === table.options.meta?.walletAddress ? (
              <Badge variant={'grey'} className="px-1">
                {`You`}
              </Badge>
            ) : null}
            <TruncatedAddress
              className="max-w-[12ch] truncate text-right font-medium"
              address={row.original.traderAddress}
              charsStart={3}
              charsEnd={3}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'txHash',
    size: 24,
    header: () => '',
    cell: ({ row }) => {
      return (
        <ExternalLink
          className="text-neutral-400 max-sm:hidden"
          href={`https://solscan.io/tx/${row.original.txHash}`}
        >
          <ExternalIcon height={12} width={12} />
        </ExternalLink>
      );
    },
  },
];

const SKELETON_COUNT = 5;

export const SkeletonTableRows: React.FC = () => {
  return (
    <>
      {new Array(SKELETON_COUNT).fill(0).map((_, i) => (
        <SkeletonTableRow key={i} index={i} />
      ))}
    </>
  );
};

const SkeletonTableRow: React.FC<{ index: number }> = ({ index }) => {
  const opacity = Math.max(0, 1 - index / SKELETON_COUNT);
  return (
    <TableRow
      style={{
        opacity,
      }}
    >
      {/* Date / Age */}
      <TableCell>
        <Skeleton className="h-6 w-14 lg:w-28" />
      </TableCell>

      {/* Type */}
      <TableCell className="max-lg:hidden">
        <Skeleton className="h-6 w-9" />
      </TableCell>

      {/* Price */}
      <TableCell>
        <Skeleton className="ml-auto h-6 w-16 lg:w-9" />
      </TableCell>

      {/* Usd Volume */}
      <TableCell>
        <Skeleton className="ml-auto h-6 w-16 lg:w-20" />
      </TableCell>

      {/* Asset Volume */}
      <TableCell>
        <Skeleton className="ml-auto h-6 w-12 lg:w-20" />
      </TableCell>

      {/* Trader */}
      <TableCell className="max-sm:hidden">
        <Skeleton className="ml-auto h-6 w-28" />
      </TableCell>
    </TableRow>
  );
};
