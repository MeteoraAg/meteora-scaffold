import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  createContext,
  memo,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { isHoverableDevice } from '@/lib/device';
import {
  HoverPopoverContent,
  HoverPopoverContentProps,
  HoverPopoverTrigger,
  HoverPopoverTriggerProps,
} from './index';

type HoverPopoverContextType = {
  open: boolean;
  handleOpen: (open: boolean) => void;
  handleMouseLeave: () => void;
  handleMouseEnter: () => void;
};

const HoverPopoverContext = createContext<HoverPopoverContextType>({
  open: false,
  handleOpen: () => {},
  handleMouseLeave: () => {},
  handleMouseEnter: () => {},
});

type HoverPopoverProps = HoverPopoverTriggerProps &
  Pick<
    HoverPopoverContentProps,
    'sideOffset' | 'side' | 'alignOffset' | 'align' | 'collisionPadding'
  > & {
    delayDuration?: number | undefined;
    root?: boolean | undefined;
    content?: ReactNode | undefined;
    /**
     * Disables opening/closing the popover on hover
     */
    disableHover?: boolean | undefined;
    /**
     * Use external state to track open/close state
     * of the popover
     */
    open?: boolean;
    /**
     * Use external state to set the open/close state
     * of the popover
     */
    setOpen?: (open: boolean) => void;
  };

/**
 * Wrapper for radix-ui popover component with hover on desktop and click on mobile.
 * Usage depends on whether the `root` props is true or false.
 *
 * When `root` is true, use as follows:
 * ```ts
    <HoverPopover root delayDuration={150}>
      <HoverPopoverTrigger>
        hover on me
      </HoverPopoverTrigger>
      <HoverPopoverContent>
        content displayed on trigger hover
      </HoverPopoverContent>
    </HoverPopover>
 * ```
 *
 * When `root` is false | undefined, use as follows:
 * ```ts
    <HoverPopover
      content={<>content displayed on trigger hover</>}
    >
      hover on me
    </HoverPopover>
 * ```
 * For implementation details, see the following:
 * - `https://github.com/radix-ui/primitives/issues/2051`
 * - `https://github.com/radix-ui/primitives/blob/main/packages/react/tooltip/src/tooltip.tsx`
 */
// eslint-disable-next-line react/display-name
const HoverPopover: React.FC<PropsWithChildren<HoverPopoverProps>> = memo(
  ({
    delayDuration = 0,
    root,
    content,
    disableHover,
    open: propsOpen,
    setOpen: propsSetOpen,
    children,
    className,

    // Content props
    sideOffset,
    side,
    alignOffset,
    align,
    collisionPadding,

    ...props
  }) => {
    const [_open, _setOpen] = useState<boolean>(false);
    const openTimerRef = useRef<number>(0);
    const isOpenDelayed = useMemo(() => delayDuration > 0, [delayDuration]);

    const externalState = propsOpen !== undefined && propsSetOpen !== undefined;
    const open = useMemo(() => {
      return externalState ? propsOpen : _open;
    }, [externalState, propsOpen, _open]);

    const setOpen = useMemo(() => {
      return externalState ? propsSetOpen : _setOpen;
    }, [externalState, _setOpen, propsSetOpen]);

    const handleDelayedOpenChange = useCallback(
      (newOpen: boolean) => {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = window.setTimeout(() => {
          setOpen(newOpen);
          openTimerRef.current = 0;
        }, delayDuration);
      },
      [delayDuration, setOpen, openTimerRef]
    );

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        // Clear the timer in case the pointer leaves the trigger before the tooltip is opened.
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = 0;
        setOpen(newOpen);
      },
      [setOpen, openTimerRef]
    );

    const handleMouseEnter = useCallback(() => {
      if (!isHoverableDevice() || disableHover) {
        return;
      }
      if (isOpenDelayed) {
        handleDelayedOpenChange(true);
      } else {
        handleOpenChange(true);
      }
    }, [isOpenDelayed, disableHover, handleDelayedOpenChange, handleOpenChange]);

    const handleMouseLeave = useCallback(() => {
      if (!isHoverableDevice() || disableHover) {
        return;
      }
      if (isOpenDelayed) {
        handleDelayedOpenChange(false);
      } else {
        handleOpenChange(false);
      }
    }, [isOpenDelayed, disableHover, handleDelayedOpenChange, handleOpenChange]);

    const handleOpen = useCallback(
      (newOpen: boolean) => {
        if (!isHoverableDevice() || disableHover) {
          setOpen(newOpen);
        }
      },
      [disableHover, setOpen]
    );

    useEffect(() => {
      return () => {
        if (openTimerRef.current) {
          window.clearTimeout(openTimerRef.current);
          openTimerRef.current = 0;
        }
      };
    }, []);

    return (
      <HoverPopoverContext.Provider
        value={{ open, handleOpen, handleMouseEnter, handleMouseLeave }}
      >
        <PopoverPrimitive.Root open={open} onOpenChange={handleOpen}>
          {root ? (
            <div>{children}</div>
          ) : (
            <>
              <HoverPopoverTrigger className={className} {...props}>
                {children}
              </HoverPopoverTrigger>
              <HoverPopoverContent
                sideOffset={sideOffset}
                side={side}
                alignOffset={alignOffset}
                align={align}
                collisionPadding={collisionPadding}
              >
                {content}
              </HoverPopoverContent>
            </>
          )}
        </PopoverPrimitive.Root>
      </HoverPopoverContext.Provider>
    );
  }
);

const useHoverPopover = () => {
  const ctx = useContext(HoverPopoverContext);
  if (!ctx) {
    throw new Error('useHoverPopover must be used within HoverPopover');
  }
  return ctx;
};

export { HoverPopover, useHoverPopover };
