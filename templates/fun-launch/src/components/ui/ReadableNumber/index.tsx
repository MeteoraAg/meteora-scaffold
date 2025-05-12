import { memo, useEffect, useMemo, useRef, useState } from 'react';

import styles from './index.module.css';
import { cn } from '@/lib/utils';
import {
  formatReadableNumber,
  getReadablePriceFormat,
  ReadableNumberFormat,
} from '@/lib/format/number';
import { DigitSubscript } from './DigitSubscript';
import CaretUpIcon from '@/icons/CaretUpIcon';

export const getNumberColorCn = (num?: number | null) => {
  if (num === undefined || num === null) {
    return 'text-neutral-600';
  }
  return {
    'text-neutral-500': num === 0,
    'text-emerald': num > 0,
    'text-rose': num < 0,
  };
};

type ReadableNumberProps = Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> & {
  format?: ReadableNumberFormat | 'price';

  num?: number | null;
  prefix?: string;
  suffix?: string;
  integer?: boolean;
  /**
   * Highlight number when positive/negative
   */
  color?: boolean;
  /**
   * Plays an animation when number changes
   */
  animated?: boolean;
  /**
   * Flash must be used with `showDirection`
   */
  showDirection?: boolean;
  /**
   * Whether to show zeros in subscript form
   *
   * @default true
   */
  subscript?: boolean;
};

const BaseReadableNumber: React.FC<Omit<ReadableNumberProps, 'animated' | 'showDirection'>> = ({
  num,
  format,
  prefix,
  suffix,
  integer,
  color,
  subscript,
  className,
  ...props
}) => {
  const resolvedFormat = useMemo(() => {
    if (format === 'price') {
      return getReadablePriceFormat(num);
    }
    return format;
  }, [format, num]);
  const formatted = useMemo(
    () => formatReadableNumber(num, { integer, format: resolvedFormat, prefix, suffix, subscript }),
    [num, integer, resolvedFormat, prefix, suffix, subscript]
  );
  return (
    <span
      className={cn(
        'relative inline-flex items-center rounded-sm',
        color ? getNumberColorCn(num) : num === undefined ? 'text-neutral-600' : '',
        className
      )}
      {...props}
    >
      <DigitSubscript value={formatted} />
    </span>
  );
};

const AnimatedReadableNumber: React.FC<Omit<ReadableNumberProps, 'animated'>> = ({
  num,
  format,
  prefix,
  suffix,
  integer,
  color,
  subscript,
  className,
  showDirection,
  ...props
}) => {
  const [isFlash, setIsFlash] = useState(false);
  const [isSlowFlash, setIsSlowFlash] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevNum = useRef(num);

  useEffect(() => {
    if (prevNum.current === num) return;
    const prev = prevNum.current;
    prevNum.current = num;

    const netChange = (num ?? 0) - (prev ?? 0);
    if (netChange !== 0) {
      setDirection(netChange > 0 ? 'up' : 'down');
    }
    if (prev === undefined) {
      return;
    }

    // Flash only when there was a prev number
    setIsFlash(true);
    setIsSlowFlash(true);
    const t1 = setTimeout(() => setIsFlash(false), 950);
    const t2 = setTimeout(() => setIsSlowFlash(false), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [num]);

  const resolvedFormat = useMemo(() => {
    if (format === 'price') {
      return getReadablePriceFormat(num);
    }
    return format;
  }, [format, num]);

  const formatted = useMemo(
    () => formatReadableNumber(num, { integer, format: resolvedFormat, prefix, suffix, subscript }),
    [num, integer, resolvedFormat, prefix, suffix, subscript]
  );

  return (
    <span
      className={cn(
        'relative inline-flex items-center rounded-sm',
        color ? getNumberColorCn(num) : num === undefined ? 'text-neutral-600' : '',
        isFlash && styles.flashBg,
        className
      )}
      {...props}
    >
      {num !== undefined && prevNum.current !== undefined && showDirection && direction && (
        <CaretUpIcon
          width={10}
          height={10}
          className={cn(
            'absolute left-0 top-1/2 h-4 w-4 -translate-x-full -translate-y-1/2 transition-all duration-300',
            {
              'opacity-100': isSlowFlash,
              'opacity-0': !isSlowFlash || direction === null,
              'text-emerald': direction === 'up',
              'rotate-180 text-rose': direction === 'down',
            }
          )}
        />
      )}
      <DigitSubscript value={formatted} />
    </span>
  );
};

export const ReadableNumber: React.FC<ReadableNumberProps> = memo(({ animated, ...props }) => {
  if (!animated) {
    return <BaseReadableNumber {...props} />;
  }
  return <AnimatedReadableNumber {...props} />;
});

ReadableNumber.displayName = 'ReadableNumber';
