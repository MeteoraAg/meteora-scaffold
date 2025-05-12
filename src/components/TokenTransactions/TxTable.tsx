import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { notUndefined, useVirtualizer } from '@tanstack/react-virtual';
import { useAtom } from 'jotai';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DateMode, dateModeAtom } from './datemode';
import { useWallet } from '@jup-ag/wallet-adapter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { cn } from '@/lib/utils';
import { PausedIndicator } from '../Explore/PausedIndicator';
import { isHoverableDevice } from '@/lib/device';
import { SkeletonTableRows } from './columns';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    dateMode: DateMode;
    setDateMode: (mode: DateMode) => void;
    walletAddress: string | undefined;
    symbol: string | undefined;
  }
}

const ROW_HEIGHT = 36;

type TxTableProps<TData, TValue> = {
  symbol?: string | undefined;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hasNextPage: boolean | undefined;
  isFetching: boolean;
  fetchNextPage: () => void;
  paused: boolean;
  setPaused: (paused: boolean) => void;
};

export function TxTable<TData, TValue>({
  symbol,
  columns,
  data,
  hasNextPage,
  isFetching,
  fetchNextPage,
  paused,
  setPaused,
}: TxTableProps<TData, TValue>) {
  // const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [dateMode, setDateMode] = useAtom(dateModeAtom);
  const { publicKey } = useWallet();
  const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

  // Please refer to https://tanstack.com/table/latest/docs/faq#how-do-i-stop-infinite-rendering-loops
  // for rendering optimisations
  const table = useReactTable({
    // Data
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // // Sorting
    // onSortingChange: setSorting,
    // getSortedRowModel: getSortedRowModel(),
    // Filtering
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      // sorting,
      columnFilters,
    },
    meta: {
      dateMode,
      setDateMode,
      walletAddress,
      symbol,
    },
  });

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
    // Memoisation is REQUIRED to optimise rendering
    // @see https://tanstack.com/virtual/v3/docs/api/virtualizer#getitemkey
    getItemKey: useCallback((index: number) => rows[index]?.id ?? index, [rows]),
  });
  const items = virtualizer.getVirtualItems();
  const [before, after] =
    items.length > 0
      ? [
          notUndefined(items[0]).start - virtualizer.options.scrollMargin,
          virtualizer.getTotalSize() - notUndefined(items[items.length - 1]).end,
        ]
      : [0, 0];

  const tableRef = useRef<HTMLDivElement>(null);
  const onScroll = useCallback(() => {
    const tableEl = tableRef.current;
    if (!tableEl?.parentElement) {
      return;
    }
    const { scrollHeight, scrollTop, clientHeight } = tableEl.parentElement;
    if (scrollHeight - scrollTop - clientHeight > 3 * ROW_HEIGHT) {
      return;
    }
    if (isFetching || !hasNextPage) {
      return;
    }
    fetchNextPage();
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    const tableEl = tableRef.current;
    tableEl?.parentElement?.addEventListener('scroll', onScroll, {
      passive: true,
    });
    return () => {
      tableEl?.parentElement?.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto">
      <div
        ref={tableRef}
        className="relative -mt-px w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        <Table className="text-xs">
          <TableHeader className="sticky -top-px z-10 bg-neutral-950">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} isSticky>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className={cn({
                        'max-lg:hidden': header.id === 'type',
                        'max-sm:hidden': header.id === 'traderAddress' || header.id === 'txHash',
                      })}
                    >
                      {header.id === 'timestamp' ? (
                        paused ? (
                          <div className="flex h-full items-center">
                            <PausedIndicator />
                          </div>
                        ) : !header.isPlaceholder ? (
                          flexRender(header.column.columnDef.header, header.getContext())
                        ) : null
                      ) : header.id === 'returnAmount' ? (
                        <div className="text-right">{symbol}</div>
                      ) : !header.isPlaceholder ? (
                        flexRender(header.column.columnDef.header, header.getContext())
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className="w-full"
            onMouseEnter={() => {
              // Disable when first fetching
              if (data.length === 0 && isFetching) {
                return;
              }
              // iOS triggers, but we don't want to show the hover
              if (!isHoverableDevice()) {
                return;
              }
              setPaused(true);
            }}
            onMouseLeave={() => setPaused(false)}
          >
            {before > 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ height: before }} />
              </tr>
            ) : null}

            {items.length > 0 ? (
              <>
                {items.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn({
                        'text-emerald': row.getValue('type') === 'buy',
                        'text-rose': row.getValue('type') === 'sell',
                      })}
                      style={{
                        height: `${virtualRow.size}px`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn({
                            'max-lg:hidden': cell.column.id === 'type',
                            'max-sm:hidden':
                              cell.column.id === 'traderAddress' || cell.column.id === 'txHash',
                          })}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {/* Next page loading indicator */}
                {isFetching ? (
                  <MessageRow colSpan={columns.length}>Loading txs...</MessageRow>
                ) : null}
              </>
            ) : isFetching ? (
              <>
                {/* First page loading indicator */}
                <SkeletonTableRows />
              </>
            ) : hasNextPage === false ? (
              <>
                {/* No more txs  */}
                <MessageRow colSpan={columns.length}>No more txs</MessageRow>
              </>
            ) : null}

            {after > 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ height: after }} />
              </tr>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type MessageRowProps = {
  colSpan: number;
};
const MessageRow: React.FC<PropsWithChildren<MessageRowProps>> = ({ colSpan, children }) => {
  return (
    <tr>
      <td className="table-cell h-10 text-neutral-500" colSpan={colSpan}>
        <div className="flex items-center justify-center">{children}</div>
      </td>
    </tr>
  );
};
