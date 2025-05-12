import Decimal from 'decimal.js';

const getDecimalCount = (value: string) => {
  const parts = value.split('.');
  return parts.length > 1 ? parts[1].length : 0;
};

const userLocale =
  typeof window !== 'undefined'
    ? navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language
    : 'en-US';

export const formatChartPrice = (
  val: number,
  precision?: number,
  keepTrailingZeros = false
): string => {
  // Use the default precision if not provided
  const defaultDecimals = getDecimalCount(val.toString());
  const finalPrecision = precision ?? defaultDecimals;

  // Format the number according to user locale
  const numberFormatter = new Intl.NumberFormat(userLocale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 5,
    maximumFractionDigits: finalPrecision,
    minimumFractionDigits: keepTrailingZeros ? finalPrecision : 0, // Ensure trailing zeroes are kept
  });

  const formattedNumber = numberFormatter.format(val);
  return formattedNumber;
};

function generateSubscriptNumbers(x: number): string {
  const subscriptNumbers: string[] = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  const xString: string = x.toString();
  let result: string = '';

  for (let i = 0; i < xString.length; i++) {
    const digit: number = parseInt(xString.charAt(i), 10);
    const subscriptNumber: string = subscriptNumbers[digit];

    if (subscriptNumber) {
      result += subscriptNumber;
    }
  }

  return result;
}

export const formatNumber = {
  format: (val?: string | Decimal, precision?: number): string => {
    if (!val) {
      // TODO: why did we even do `--`, i blame zy
      return '--';
    }

    // Use the default precision if not provided
    const defaultDecimals = getDecimalCount(val.toString());
    // format it against user locale
    const numberFormatter = new Intl.NumberFormat(userLocale, {
      maximumFractionDigits: precision ?? defaultDecimals,
    });
    return numberFormatter.format(Number(val));
  },
};

// To find out the precision we should use
export const getPrecisionTick = (
  value: number,
  maxSuffix: number = 6
): [number, string, string] => {
  if (value === 0) return [0, '0', '0'];

  const firstSD = Decimal.ceil(new Decimal(-1).mul(Decimal.log10(Decimal.abs(value)))).toNumber();

  // When value is greater than 0
  if (new Decimal(value).gte(0.000_1)) {
    const [integer, decimals] = new Decimal(value).toSignificantDigits(4).toFixed().split('.');
    return [0, integer || '', decimals || ''];
  }

  // When value is less than 0
  const prefix = new Decimal(value).toFixed().slice(0, firstSD + 2); // +2 to account for 0.
  const suffix = (() => {
    const val = new Decimal(value)
      .toFixed() // round to SD + maxSuffix
      .slice(1 + firstSD); // get rid of 0. returns SD + maxSuffix decimals

    return val.slice(0, maxSuffix);
  })();

  return [firstSD, prefix, suffix];
};

// Returns text only
export const getPrecisionTickSizeText = ({
  value,
  maxSuffix,
}: {
  value: number;
  maxSuffix?: number;
}): string => {
  const [firstSD, _, suffix] = getPrecisionTick(value);

  if (new Decimal(value).gte(0.000_1)) {
    return value.toFixed(suffix.length);
  }

  return '0.0' + generateSubscriptNumbers(firstSD - 1) + suffix.slice(0, maxSuffix);
};
