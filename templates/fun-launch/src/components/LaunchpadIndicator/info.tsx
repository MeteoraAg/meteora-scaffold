import { IconProps } from '@/icons/types';
import { Launchpad } from '../Explore/types';
import { PumpfunIcon } from '@/icons/PumpfunIcon';
import { DaosfunIcon } from '@/icons/DaosfunIcon';
import { BelieveIcon } from '@/icons/BelieveIcon';
import { BoopIcon } from '@/icons/BoopIcon';
import { CookmemeIcon } from '@/icons/CookmemeIcon';
import { DBCIcon } from '@/icons/DBCIcon';
import { DealrIcon } from '@/icons/DealrIcon';
import { DialectIcon } from '@/icons/DialectIcon';
import { GoFundMemeIcon } from '@/icons/GoFundMemeIcon';
import { LetsbonkfunIcon } from '@/icons/LetsbonkfunIcon';
import { MentatfunIcon } from '@/icons/MentatfunIcon';
import { RaydiumIcon } from '@/icons/RaydiumIcon';
import { TimefunIcon } from '@/icons/TimefunIcon';
import { VirtualsIcon } from '@/icons/VirtualsIcon';
import { XCombinatorIcon } from '@/icons/XCombinatorIcon';
import { cn } from '@/lib/utils';

type LaunchpadInfo = {
  label: string;
  /**
   * The link to the launchpad website for a token
   */
  href?: (id: string) => string | undefined;
  icon: React.FC<IconProps>;
  color: string;
  borderColor: string;
  /**
   * Whether we support the launchpad bonding curve
   *
   * We only support bonded tokens, without bonding curve for some launchpads
   */
  bondingCurveSupported?: boolean;
};

export const LaunchpadInfo: Partial<Record<Launchpad, LaunchpadInfo>> = {
  [Launchpad.PUMPFUN]: {
    label: 'Pump',
    href: (id: string) => `https://pump.fun/coin/${id}`,
    icon: (props) => <PumpfunIcon aria-label="Pump" {...props} />,
    color: '#60CD88',
    borderColor: '#60CD88',
    bondingCurveSupported: true,
  },
  [Launchpad.VIRTUALS]: {
    label: 'Virtuals',
    href: (id: string) => `https://app.virtuals.io/prototypes/${id}`,
    icon: (props) => <VirtualsIcon aria-label="Virtuals" {...props} />,
    color: '#236D66',
    borderColor: '#236D66',
    bondingCurveSupported: true,
  },
  [Launchpad.DAOSFUN]: {
    label: 'DaosFun',
    href: (id: string) => `https://daos.fun/${id}`,
    icon: (props) => <DaosfunIcon aria-label="DaosFun" {...props} />,
    color: 'white',
    borderColor: 'white',
  },
  [Launchpad.TIMEFUN]: {
    label: 'TimeFun',
    href: (symbol: string) => `https://time.fun/${symbol}`,
    icon: (props) => <TimefunIcon aria-label="TimeFun" {...props} />,
    color: '#FF9FC6',
    borderColor: '#FF9FC6',
  },
  [Launchpad.GOFUNDMEME]: {
    label: 'GofundMeme',
    href: (id: string) => `https://gofundmeme.com/coin/${id}`,
    icon: (props) => <GoFundMemeIcon aria-label="GofundMeme" {...props} />,
    color: 'white',
    borderColor: 'white',
  },
  [Launchpad.DEALR]: {
    label: 'Dealr',
    href: () => `https://dealr.fun`,
    icon: (props) => <DealrIcon aria-label="Dealr" {...props} />,
    color: 'white',
    borderColor: 'white',
    bondingCurveSupported: true,
  },
  [Launchpad.DIALECT]: {
    label: 'Dialect',
    href: () => `https://dialect.to`,
    icon: ({ className, ...props }) => (
      <DialectIcon className={cn('rounded-full', className)} aria-label="Dialect" {...props} />
    ),
    color: 'white',
    borderColor: 'white',
    bondingCurveSupported: true,
  },
  [Launchpad.DBC]: {
    label: 'Meteora DBC',
    icon: (props) => <DBCIcon aria-label="Meteora DBC" {...props} />,
    color: '#F84C00',
    borderColor: '#F84C00',
    bondingCurveSupported: true,
  },
  [Launchpad.LETSBONKFUN]: {
    label: 'LetsbonkFun',
    href: (id: string) => `https://letsbonk.fun/token/${id}`,
    icon: ({ className, ...props }) => (
      <LetsbonkfunIcon
        className={cn('rounded-full', className)}
        aria-label="LetsbonkFun"
        {...props}
      />
    ),
    color: '#FF5E1E',
    borderColor: '#FF5E1E',
    bondingCurveSupported: true,
  },
  [Launchpad.RAYDIUM]: {
    label: 'Raydium',
    href: (id: string) => `https://raydium.io/launchpad/token/${id}`,
    icon: (props) => <RaydiumIcon aria-label="Raydium" {...props} />,
    color: '#FFB12B',
    borderColor: '#FFB12B',
    bondingCurveSupported: true,
  },
  [Launchpad.COOKMEME]: {
    label: 'CookMeme',
    href: (id: string) => `https://cook.meme/view/${id}`,
    icon: ({ className, ...props }) => (
      <CookmemeIcon className={cn('rounded-full', className)} aria-label="CookMeme" {...props} />
    ),
    color: '#AD55FF',
    borderColor: '#AD55FF',
    bondingCurveSupported: true,
  },
  [Launchpad.BELIEVE]: {
    label: 'Believe',
    icon: ({ className, ...props }) => (
      <BelieveIcon className={cn('rounded-full', className)} aria-label="Believe" {...props} />
    ),
    color: '#00d545',
    borderColor: '#00d545',
    bondingCurveSupported: true,
  },
  [Launchpad.BOOP]: {
    label: 'Boop',
    href: (id: string) => `https://boop.fun/tokens/${id}`,
    icon: (props) => <BoopIcon aria-label="Boop" {...props} />,
    color: '#0CAEE4',
    borderColor: '#0CAEE4',
    bondingCurveSupported: true,
  },
  [Launchpad.XCOMBINATOR]: {
    label: 'xCombinator',
    icon: ({ className, ...props }) => (
      <XCombinatorIcon
        className={cn('rounded-full', className)}
        aria-label="xCombinator"
        {...props}
      />
    ),
    color: 'white',
    borderColor: 'white',
    bondingCurveSupported: true,
  },
  [Launchpad.MENTATFUN]: {
    label: 'MentatFun',
    icon: ({ className, ...props }) => (
      <MentatfunIcon className={cn('rounded-full', className)} aria-label="MentatFun" {...props} />
    ),
    color: 'white',
    borderColor: 'white',
    bondingCurveSupported: true,
  },
};
export const LAUNCHPAD_INFOS = Object.entries(LaunchpadInfo)
  .map(([launchpad, info]) => ({
    launchpad: launchpad as Launchpad,
    info,
  }))
  // We display launchpads that DON'T supoprt bonding curve at the bottom
  .sort((a, b) => (!a.info.bondingCurveSupported ? 1 : !b.info.bondingCurveSupported ? -1 : 0));

export function getLaunchpadInfo(launchpad?: string): LaunchpadInfo | null {
  if (!launchpad) return null;
  return LaunchpadInfo[launchpad as keyof typeof LaunchpadInfo] ?? null;
}
