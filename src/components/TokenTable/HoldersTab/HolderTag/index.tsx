import { ComponentProps, memo, useMemo } from 'react';

import { HoverPopover } from '@/components/ui/HoverPopover';
import { cn } from '@/lib/utils';
import { CustomHolderTag } from '@/components/Explore/types';

const HolderTag = {
  CUSTOM: 'Custom',
} as const;
type HolderTag = (typeof HolderTag)[keyof typeof HolderTag];

const HolderTagInfo: Record<
  HolderTag,
  {
    label?: string;
    className?: string;
  }
> = {
  [HolderTag.CUSTOM]: {
    className: 'bg-primary-800 text-primary-300',
  },
};

type HolderAddressTagProps = {
  address: string;
  tags?: CustomHolderTag[] | undefined;
};

export const HolderAddressTag: React.FC<HolderAddressTagProps> = ({ address, tags }) => {
  // We only display the first custom tag provided
  const customTag = useMemo(() => {
    if (!tags || tags.length === 0) {
      return;
    }
    return tags[0];
  }, [tags]);

  if (customTag) {
    return <HolderCustomTag tag={customTag} />;
  }

  return null;
};

type HolderCustomTagProps = {
  tag: CustomHolderTag;
};
const HolderCustomTag: React.FC<HolderCustomTagProps> = memo(({ tag }) => {
  return (
    <HoverPopover content={tag.name}>
      <BaseTag className={HolderTagInfo[HolderTag.CUSTOM].className}>{tag.id}</BaseTag>
    </HoverPopover>
  );
});

HolderCustomTag.displayName = 'HolderCustomTag';

const BaseTag: React.FC<ComponentProps<'div'>> = memo(({ className, ...props }) => {
  return (
    <div
      className={cn(
        'ml-1.5 rounded-full bg-neutral-850 px-2 py-0.5 text-xs font-medium text-neutral-400',
        className
      )}
      {...props}
    />
  );
});

BaseTag.displayName = 'BaseTag';
