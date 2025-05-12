import React, { ReactNode, useCallback, useRef, useState } from 'react';
import { HoverPopover } from './HoverPopover/context';
import { HoverPopoverContent, HoverPopoverTrigger } from './HoverPopover';

type CopyableProps = {
  copyText: string;
  name: string;
  className?: string;
  children?: ReactNode | ((copied: boolean) => ReactNode);
};

export const Copyable: React.FC<CopyableProps> = ({ copyText, name, className, children }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [copyText]);

  return (
    <HoverPopover root={true}>
      <HoverPopoverTrigger>
        <div className={className} onClick={handleClick} data-copied={copied}>
          {typeof children === 'function' ? children(copied) : children}
        </div>
      </HoverPopoverTrigger>

      <HoverPopoverContent>
        <div className="flex items-center gap-0.5">{(copied ? `Copied` : `Copy`) + ' ' + name}</div>
      </HoverPopoverContent>
    </HoverPopover>
  );
};
