import { useCurrentDate } from '@/lib/environment/date';
import { formatAge } from '@/lib/format/date';
import { cn } from '@/lib/utils';
import React, { memo } from 'react';

const RECENT_AGE_THRESHOLD = 1000 * 60 * 60 * 2; // 2h

type TokenAgeProps = React.ComponentPropsWithoutRef<'span'> & {
  date?: string;
};

export const TokenAge: React.FC<TokenAgeProps> = memo(({ date: dateStr, className, ...props }) => {
  // Use date from context to avoid multiple timers
  const now = useCurrentDate();

  const date = dateStr ? new Date(dateStr) : undefined;
  const isRecent = date && date.getTime() > now.getTime() - RECENT_AGE_THRESHOLD;

  return (
    <span
      className={cn(
        'min-w-[2ch] tabular-nums leading-none tracking-tight',
        {
          'text-neutral-500': date === undefined,
          'text-primary': isRecent,
        },
        className
      )}
      {...props}
    >
      {formatAge(date, now)}
    </span>
  );
});

TokenAge.displayName = 'TokenAge';
