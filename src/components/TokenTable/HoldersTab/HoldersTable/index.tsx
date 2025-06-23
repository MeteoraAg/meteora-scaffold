import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { notUndefined, useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table';

const ROW_HEIGHT = 36;

type HolderTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
};

export function HolderTable<TData, TValue>({ columns, data }: HolderTableProps<TData, TValue>) {
  // const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Please refer to https://tanstack.com/table/latest/docs/faq#how-do-i-stop-infinite-rendering-loops
  // for rendering optimisations
  const table = useReactTable({
    // Data
    data: data ?? [],
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

  return (
    <>
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div
          ref={tableRef}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <Table className="text-xs">
            <TableHeader className="sticky -top-px z-10 bg-neutral-950">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="h-8" isSticky>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() }}
                        className={cn({
                          'max-xs:hidden': header.id === 'amount',
                        })}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {before > 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ height: before }} />
                </tr>
              ) : null}

              {items.length > 0 ? (
                items.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <TableRow
                      key={row.id}
                      className={cn('text-neutral-300')}
                      data-state={row.getIsSelected() && 'selected'}
                      style={{
                        height: `${virtualRow.size}px`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn({
                            'max-xs:hidden': cell.column.id === 'amount',
                          })}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : data ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex w-full justify-center text-neutral-500">No holders</div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex w-full justify-center text-neutral-500">
                      No data available
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {after > 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ height: after }} />
                </tr>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
