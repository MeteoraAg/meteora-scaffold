import React from 'react';
import { HoverPopover } from '@/components/ui/HoverPopover';
import { cn } from '@/lib/utils';

type PoolIndicatorProps = React.ComponentPropsWithoutRef<'span'>;

export const PoolIndicator: React.FC<PoolIndicatorProps> = ({ className, ...props }) => {
  return (
    <HoverPopover content="Token Pool" asChild>
      <span className={cn('iconify text-blue-400 ph--drop-bold', className)} {...props} />
    </HoverPopover>
  );
};
