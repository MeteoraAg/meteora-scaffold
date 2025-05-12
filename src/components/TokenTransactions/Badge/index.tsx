import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva('inline-flex items-center rounded px-1 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      grey: 'bg-neutral-400/10 text-neutral-400',
      green: 'bg-emerald/10 text-emerald',
      red: 'bg-rose/10 text-rose',
    },
  },
  defaultVariants: {
    variant: 'grey',
  },
});

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
