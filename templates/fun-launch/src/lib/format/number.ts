export const DASH = '-';

const COMPACT_THRESHOLD = 1000;
const LONG_THRESHOLD = 10;
const SMALL_DECIMALS = 5;

export function getReadablePriceFormat(price?: number | null): ReadableNumberFormat {
  if (price === undefined || price === null) {
    return ReadableNumberFormat.SMALL;
  }
  if (price >= 100_000) {
    return ReadableNumberFormat.COMPACT;
  }
  if (price > LONG_THRESHOLD) {
    return ReadableNumberFormat.LONG;
  }
  return ReadableNumberFormat.SMALL;
}

// Lazily memoize formatters for each decimal precision
const intlNumberSmallFormatters: Record<number, Intl.NumberFormat> = {};
function getNumberSmallFormatter(decimals: number): Intl.NumberFormat {
  if (intlNumberSmallFormatters[decimals]) {
    return intlNumberSmallFormatters[decimals];
  }

  const formatter = new Intl.NumberFormat(undefined, {
    minimumSignificantDigits: 3,
    maximumSignificantDigits: decimals,
    maximumFractionDigits: decimals,
    roundingMode: 'trunc',
  });
  intlNumberSmallFormatters[decimals] = formatter;
  return formatter;
}

const intlNumberCompact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  compactDisplay: 'short',
  minimumSignificantDigits: 3,
  maximumSignificantDigits: 3,
});

const intlNumberLong = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intlNumberSmall = getNumberSmallFormatter(SMALL_DECIMALS);

const intlIntegerCompact = new Intl.NumberFormat(undefined, {
  ...intlNumberCompact.resolvedOptions(),
  minimumSignificantDigits: 1,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const intlIntegerLong = new Intl.NumberFormat(undefined, {
  ...intlNumberLong.resolvedOptions(),
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const intlIntegerSmall = new Intl.NumberFormat(undefined, {
  ...intlNumberSmall.resolvedOptions(),
  minimumSignificantDigits: 1,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const intlPctChange = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const intlPctChangeOneDec = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const intlPctChangeZeroDec = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const intlPctChangeNoSign = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'never',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const intlPctChangeNoSignOneDec = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'never',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const intlPctChangeNoSignZeroDec = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'never',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const ReadableNumberFormat = {
  COMPACT: 'compact',
  LONG: 'long',
  SMALL: 'small',
} as const;
export type ReadableNumberFormat = (typeof ReadableNumberFormat)[keyof typeof ReadableNumberFormat];

type FormatReadableNumberOptions = {
  prefix?: string;
  suffix?: string;
  integer?: boolean;
  /**
   * Decimal precision to show for small numbers
   *
   * @default 5
   */
  decimals?: number;
  /**
   * Whether to show zeros in subscript form
   *
   * @default true
   */
  subscript?: boolean;
  format?: ReadableNumberFormat;
};

function getReadableNumberFormatter(
  value: number,
  options: FormatReadableNumberOptions
): Intl.NumberFormat {
  if (
    (!options.format && value > COMPACT_THRESHOLD) ||
    options.format === ReadableNumberFormat.COMPACT
  ) {
    return options.integer ? intlIntegerCompact : intlNumberCompact;
  }
  if ((!options.format && value > LONG_THRESHOLD) || options.format === ReadableNumberFormat.LONG) {
    return options.integer ? intlIntegerLong : intlNumberLong;
  }

  if (options.integer) {
    return intlIntegerSmall;
  }
  const decimals = options.decimals ?? SMALL_DECIMALS;
  return getNumberSmallFormatter(decimals);
}

/**
 * Formats a number in a human-readable form
 */
export function formatReadableNumber(
  num?: number | null,
  options: FormatReadableNumberOptions = {}
): string {
  if (num === null || num === undefined || isNaN(num)) {
    return DASH;
  }

  const abs = Math.abs(num);
  let formatted = getReadableNumberFormatter(abs, options).format(num);

  if (abs < 0.001 && abs !== 0 && options.subscript !== false) {
    const zeroes = countInsignificantFractionalZeroes(abs);
    const prefix = formatted.slice(0, num < 0 ? 4 : 3);
    const suffix = formatted.slice((num < 0 ? 3 : 2) + zeroes);
    formatted = `${prefix}${zeroes > 0 ? formatSubscript(zeroes) : ''}${suffix}`;
  }

  // Apply prefix before negative sign
  if (options.prefix) {
    if (num < 0 && formatted[0] === '-') {
      formatted = options.prefix + formatted.slice(1);
      formatted = '-' + formatted;
    } else {
      formatted = options.prefix + formatted;
    }
  }
  if (options.suffix) {
    formatted = formatted + options.suffix;
  }

  return formatted;
}

/**
 * Formats a percentage change in a human-readable form
 *
 * For example, 0.1 = +10%
 *              10 = +10x
 */
export function formatReadablePercentChange(
  num?: number | null,
  options: { hideSign?: 'all' | 'positive'; decimals?: 0 | 1 | 2 } = {}
): string {
  if (num === null || num === undefined || isNaN(num)) {
    return DASH;
  }
  if (num < 10) {
    if (options.hideSign === 'all' || (options.hideSign === 'positive' && num >= 0)) {
      const formatter =
        options.decimals === 0
          ? intlPctChangeNoSignZeroDec
          : options.decimals === 1
            ? intlPctChangeNoSignOneDec
            : intlPctChangeNoSign;
      return formatter.format(num);
    }
    const formatter =
      options.decimals === 0
        ? intlPctChangeZeroDec
        : options.decimals === 1
          ? intlPctChangeOneDec
          : intlPctChange;
    return formatter.format(num);
  }
  return (!options.hideSign && num > 0 ? '+' : '') + Math.round(num).toString() + 'x';
}

export const DIGIT_SUBSCRIPT: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

export const SUBSCRIPT_DIGIT: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
};

export const DIGIT_SUBSCRIPT_RE = new RegExp(`(${Object.values(DIGIT_SUBSCRIPT).join('|')})+`, 'g');

/**
 * Convert number to its subscript form
 *
 * e.g. 11 -> ₁₁
 */
function formatSubscript(num: number): string {
  return num
    .toString()
    .split('')
    .map((digit) => DIGIT_SUBSCRIPT[digit])
    .join('');
}

/**
 * Convert subscript number to normal number
 *
 * e.g. '₁₁' -> 11
 */
export function parseSubscript(num: string): number {
  const parsed = num.replace(DIGIT_SUBSCRIPT_RE, (match) => {
    let digits = '';
    for (let i = 0; i < match.length; i++) {
      digits += SUBSCRIPT_DIGIT[match[i]];
    }
    return digits;
  });
  return Number(parsed);
}

/**
 * Returns the number of insignificant fractional zeroes (ie. the number
 * of zeroes after the decimal separator) in the given number.
 *
 * For example, 0.00015 has 3 insignificant fractional zeroes.
 */
function countInsignificantFractionalZeroes(value: number | string): number {
  const num = Number(value);
  if (!isValidNumber(num) || num >= 1 || Number.isInteger(num)) {
    return 0;
  }
  const zeroes = num.toExponential(0).slice(3); // eg. "1e-123".slice(3) = 123
  return Number(zeroes) - 1;
}

function isValidNumber(num: number): boolean {
  return num !== Infinity && !isNaN(num);
}
