/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TokenIconInfo, TrenchesTokenIconContext, useTrenchesTokenIconContext } from './Context';
import { Asset } from '../Explore/types';
import { cn, getBaseUrl } from '@/lib/utils';
import { TrenchesTokenIconLaunchpad } from '../LaunchpadIndicator/LaunchpadIndicator';

/**
 * Hostnames with known issues using the CDN service
 */
const CDN_BLACKLIST_HOSTNAMES: RegExp[] = [/i.imgur.com/, /gateway.irys.xyz/];

type TrenchesTokenIconRootProps = React.PropsWithChildren<{
  token: TokenIconInfo | Asset | undefined | null;
  width?: number;
  height?: number;
  hideLaunchpad?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}>;

type TrenchesTokenIconImageProps = Omit<
  React.ComponentPropsWithoutRef<'img'>,
  'src' | 'onError' | 'alt' | 'width' | 'height'
>;

export const TrenchesTokenIconRoot: React.FC<TrenchesTokenIconRootProps> = ({
  token,
  width = 32,
  height = 32,
  hideLaunchpad,
  className,
  style,
  onError,
  children,
}) => {
  const [isValid, setIsValid] = useState(true);
  const [isCdnValid, setIsCdnValid] = useState(true);

  const imageUrl = token && ((token as Asset).icon ?? (token as TokenIconInfo)?.logoURI);

  const transformedSrc = useMemo(() => {
    if (!imageUrl) {
      return undefined;
    }
    try {
      // Use base to support relative site assets
      const src = new URL(imageUrl, getBaseUrl());

      const matched = CDN_BLACKLIST_HOSTNAMES.some((regex) => src.hostname.match(regex));
      if (matched) {
        return imageUrl;
      }

      const url = new URL(`https://wsrv.nl`);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', height.toString());
      url.searchParams.set('url', src.toString());
      // For pixel ratio, to make image sharper
      url.searchParams.set('dpr', '2');

      return url.toString();
    } catch {
      // Parsing URL might error
      return undefined;
    }
  }, [imageUrl, width, height]);

  const resolvedSrc = useMemo(() => {
    if (!transformedSrc || !isCdnValid) {
      return imageUrl ?? undefined;
    }
    return transformedSrc;
  }, [imageUrl, transformedSrc, isCdnValid]);

  const handleImageError: React.ReactEventHandler<HTMLImageElement> = useCallback(
    (e) => {
      onError?.(e);
      if (resolvedSrc && resolvedSrc !== imageUrl) {
        setIsCdnValid(false);
      } else {
        setIsValid(false);
      }
    },
    [onError, resolvedSrc, imageUrl]
  );

  return (
    <TrenchesTokenIconContext.Provider
      value={{
        token,
        width,
        height,
        onError,
        hideLaunchpad,
        isValid,
        isCdnValid,
        resolvedSrc,
        transformedSrc,
        handleImageError,
        setIsValid,
        setIsCdnValid,
      }}
    >
      <div
        className={cn('relative flex h-8 w-8 rounded-full bg-neutral-850', className)}
        style={style}
      >
        {children}
      </div>
    </TrenchesTokenIconContext.Provider>
  );
};

export const TrenchesTokenIconImage: React.FC<TrenchesTokenIconImageProps> = ({
  className,
  style,
  ...props
}) => {
  const {
    token,
    width,
    height,
    isValid,
    resolvedSrc,
    transformedSrc,
    handleImageError,
    setIsValid,
    setIsCdnValid,
  } = useTrenchesTokenIconContext();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // ssr image might not trigger error callback
    // determine error if image is loaded with no natural size
    const img = imgRef.current;
    if (img && img.complete && img.naturalHeight === 0 && isValid) {
      if (img.src !== token?.logoURI) {
        setIsCdnValid(false);
      } else {
        setIsValid(false);
      }
    }
    // Effect should only run once on mount to check initial state,
    // subsequent errors are handled by onError.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!resolvedSrc || !isValid) {
    return (
      <UnknownTokenImage
        width={width}
        height={height}
        style={style}
        className={className}
        url={token?.logoURI ?? ''}
        transformedUrl={transformedSrc ?? ''}
      />
    );
  }

  return (
    <img
      className={cn('h-full w-full rounded-full', className)}
      ref={imgRef}
      src={resolvedSrc}
      alt={token?.symbol}
      width={width}
      height={height}
      style={style}
      onError={handleImageError}
      draggable={false}
      {...props}
    />
  );
};

const UnknownTokenImage: React.FC<{
  className?: string;
  width: number;
  height: number;
  url: string;
  transformedUrl: string;
  style?: React.CSSProperties;
}> = ({ url, transformedUrl, className, ...props }) => {
  return (
    <Image
      className={cn('h-full w-full rounded-full', className)}
      alt="unknown"
      src={'/coins/unknown.svg'}
      data-url={url}
      data-transformed-url={transformedUrl}
      {...props}
    />
  );
};

type DefaultTokenIconProps = React.ComponentPropsWithoutRef<'img'> & {
  token: TokenIconInfo | Asset | undefined | null;
  width?: number;
  height?: number;
  hideLaunchpad?: boolean;
  launchpadClassName?: string;
};

/**
 * Display a token icon
 */
export const TrenchesTokenIcon: React.FunctionComponent<DefaultTokenIconProps> = ({
  token,
  width,
  height,
  hideLaunchpad,
  className,
  style,
  onError,
  children,
  ...imgProps
}) => {
  return (
    <TrenchesTokenIconRoot
      token={token}
      width={width}
      height={height}
      hideLaunchpad={hideLaunchpad}
      className={className}
      style={style}
      onError={onError}
    >
      {children ?? <TrenchesTokenIconImage {...imgProps} />}
      <TrenchesTokenIconLaunchpad />
    </TrenchesTokenIconRoot>
  );
};
