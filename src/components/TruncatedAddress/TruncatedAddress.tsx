import { cn } from '@/lib/utils';

const ELLIPSIS = '…';

type TruncatedAddressProps = React.ComponentPropsWithoutRef<'span'> & {
  address: string;
  charsStart?: number;
  charsEnd?: number;
};

export const TruncatedAddress: React.FC<TruncatedAddressProps> = ({
  address,
  charsStart = 4,
  charsEnd = 4,
  className,
  ...props
}) => {
  if (charsStart === 0 || charsEnd === 0) {
    return (
      <span className={cn('whitespace-nowrap', className)} {...props}>
        {address.slice(0, charsStart)}
        {address.slice(-charsEnd)}
      </span>
    );
  }
  return (
    <span className={cn('whitespace-nowrap', className)} {...props}>
      {address.slice(0, charsStart)}
      {ELLIPSIS}
      {address.slice(-charsEnd)}
    </span>
  );
};
