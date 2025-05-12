import { memo, useCallback, useMemo } from 'react';
import { Pool } from '../Explore/types';
import { cn } from '@/lib/utils';
import { HoverPopover } from '../ui/HoverPopover';
import { ExternalLink } from '../ui/ExternalLink';
import TelegramIcon from '@/icons/TelegramIcon';
import { WebsiteIcon } from '@/icons/WebsiteIcon';
import SearchIcon from '@/icons/SearchIcon';

type PartialBaseAsset = Pick<
  Pool['baseAsset'],
  'id' | 'website' | 'twitter' | 'telegram' | 'launchpad' | 'symbol'
>;

type TokenSocialsProps = React.ComponentPropsWithoutRef<'span'> & {
  token: PartialBaseAsset;
};

export const TokenSocials: React.FC<TokenSocialsProps> = memo(({ token, className, ...props }) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <span
      className={cn(
        'flex items-center gap-[5px] [--icon-color:theme(colors.neutral.400)]',
        className
      )}
      {...props}
    >
      <HoverPopover content={`Search CA on X`} sideOffset={4}>
        <ExternalLink
          className="group/icon"
          onClick={handleClick}
          href={`https://x.com/search?q=${token.id}`}
        >
          <SearchIcon
            // Must override the icon classes, if not we can declare on parent
            className="text-[--icon-color] opacity-60 group-hover/icon:opacity-100"
            aria-label={`Search CA on X`}
            width={12}
            height={12}
          />
        </ExternalLink>
      </HoverPopover>
      {token.telegram && (
        <ExternalLink
          className="text-[--icon-color] opacity-60 hover:opacity-100"
          onClick={handleClick}
          href={token.telegram}
        >
          <TelegramIcon aria-label="Telegram" />
        </ExternalLink>
      )}
      {token.website && (
        <ExternalLink
          className="text-[--icon-color] opacity-60 hover:opacity-100"
          onClick={handleClick}
          href={token.website}
        >
          <WebsiteIcon aria-label="Website" />
        </ExternalLink>
      )}
    </span>
  );
});

TokenSocials.displayName = 'TokenSocials';
