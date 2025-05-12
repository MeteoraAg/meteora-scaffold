import * as React from 'react';
import { formatPoolAsTokenInfo } from '../Explore/pool-utils';
import { Pool } from '@/contexts/types';
import { TrenchesTokenIconImage, TrenchesTokenIconRoot } from '.';
import { TrenchesTokenIconLaunchpad } from '../LaunchpadIndicator/LaunchpadIndicator';

type TrenchesPoolTokenIconProps = Omit<
  React.ComponentProps<typeof TrenchesTokenIconRoot>,
  'token'
> & {
  pool: Pool;
  /** Gap between the icon and the progress stroke in pixels */
  gap?: number;
};

const CIRCLE_CIRCUMFERENCE_FACTOR = 2 * Math.PI;
const STROKE_WIDTH = 2;

/**
 * Display a token icon with a bonding curve progress ring
 */
export const TrenchesPoolTokenIcon: React.FC<TrenchesPoolTokenIconProps> = ({
  pool,
  width = 32,
  height = 32,
  gap = 1,
  ...props
}) => {
  const baseSize = Math.min(width, height);
  const outerPadding = gap + STROKE_WIDTH;

  const svgWidth = width + outerPadding * 2;
  const svgHeight = height + outerPadding * 2;

  const radius = baseSize / 2 + gap + STROKE_WIDTH / 2;
  const circumference = radius * CIRCLE_CIRCUMFERENCE_FACTOR;

  // Graduated pools have no bonding curve value
  const bondingCurve = pool.bondingCurve ?? (pool.baseAsset.graduatedPool ? 100 : 0);

  const progress = bondingCurve / 100;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clampedProgress);
  const dashArray = circumference;

  return (
    <TrenchesTokenIconRoot
      token={formatPoolAsTokenInfo(pool)}
      width={width}
      height={height}
      style={{
        width,
        height,
      }}
      {...props}
    >
      <TrenchesTokenIconImage />

      {/* Bonding Curve Progress Ring */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="pointer-events-none absolute -rotate-90 transform"
        style={{
          top: `-${outerPadding}px`,
          left: `-${outerPadding}px`,
        }}
      >
        {/* Background Circle (Unfilled portion) */}
        <circle
          cx={svgWidth / 2}
          cy={svgHeight / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-primary/20"
        />
        {/* Foreground Circle (Filled portion) */}
        <circle
          cx={svgWidth / 2}
          cy={svgHeight / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="text-primary transition-all"
        />
      </svg>
      <TrenchesTokenIconLaunchpad className="-bottom-0.5 -right-0.5" />
    </TrenchesTokenIconRoot>
  );
};
