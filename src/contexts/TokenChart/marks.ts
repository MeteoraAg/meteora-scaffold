import {
  Mark,
  MarkConstColors,
  MarkCustomColor,
} from '@/components/AdvancedTradingView/charting_library';
import { Tx } from '@/components/Explore/types';

import { _IntlDate } from '@/lib/format/date';
import { formatReadableNumber } from '@/lib/format/number';

const MarkType = {
  Buy: 'Buy',
  Sell: 'Sell',
  // TODO: add when supported
  // Provide: 'Provide',
  // Withdraw: 'Withdraw',
} as const;
type MarkType = (typeof MarkType)[keyof typeof MarkType];

const markTypeColor: Record<MarkType, MarkConstColors | MarkCustomColor> = {
  Buy: 'green',
  Sell: 'red',
  // TODO: add when supported
  // Provide: 'blue',
  // Withdraw: 'yellow',
} as const;

const devMarkTypeColor: Record<MarkType, MarkConstColors | MarkCustomColor> = {
  Buy: {
    border: '#0a4f65',
    background: '#0f7494',
  },
  Sell: {
    border: '#94481C',
    background: '#f2600f',
  },
  // TODO: add when supported
  // Provide: 'blue',
  // Withdraw: 'yellow',
} as const;

const markTypeLabel: Record<MarkType, string> = {
  Buy: 'B',
  Sell: 'S',
  // TODO: add when supported
  // Provide: 'P',
  // Withdraw: 'W',
} as const;

const markTypeText: Record<MarkType, string> = {
  Buy: 'Bought',
  Sell: 'Sold',
  // TODO: add when supported
  // Provide: 'Provided',
  // Withdraw: 'Withdrew',
} as const;

const intlDate = new _IntlDate('en-US');

export function asMarks(
  txs: Tx[],
  baseAsset: { id: string; circSupply: number | undefined },
  isDev?: boolean
): Mark[] {
  const marks: Mark[] = [];
  for (const tx of txs) {
    const isBuying = tx.type === 'buy';
    const markType = isBuying ? 'Buy' : 'Sell';

    const date = new Date(tx.timestamp);
    const time = date.getTime() / 1000;
    const color = isDev ? devMarkTypeColor[markType] : markTypeColor[markType];
    const label = (isDev ? 'D' : '') + markTypeLabel[markType];
    const tradeText = (isDev ? 'Dev ' : '') + markTypeText[markType];

    const volume = tx.usdVolume;
    const price = tx.usdPrice;
    const amount = tx.amount;
    const mcap = baseAsset.circSupply ? price * baseAsset.circSupply : undefined;

    const secondaryPrice =
      mcap === undefined ? `$${formatReadableNumber(price)}` : `MC $${formatReadableNumber(mcap)}`;

    marks.push({
      id: tx.txHash,
      time,
      color,
      text: `${tradeText} ${formatReadableNumber(amount)} ($${formatReadableNumber(volume)}) at $${formatReadableNumber(
        price
      )} (${secondaryPrice}) on ${intlDate.format(date, {
        withoutYear: true,
        hour12: false,
      })}`,
      label,
      labelFontColor: 'white',
      borderWidth: 0,
      hoveredBorderWidth: 0,
      minSize: 24,
    });
  }
  return marks;
}
