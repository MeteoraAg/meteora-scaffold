import React from 'react';
import { HoverPopover } from '@/components/ui/HoverPopover';
import { cn } from '@/lib/utils';

type DevIndicatorProps = React.ComponentPropsWithoutRef<'span'>;

export const DevIndicator: React.FC<DevIndicatorProps> = ({ className, ...props }) => {
  return (
    <HoverPopover content="Token Dev" asChild>
      <span className={cn('iconify text-yellow-400 ph--chef-hat-bold', className)} {...props} />
    </HoverPopover>
  );
};
