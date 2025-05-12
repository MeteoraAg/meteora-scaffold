import { DASH } from './number';

/**
 * Formats the given `date` as a relative time string.
 */
export function formatAge(date: Date | undefined | null, now: Date) {
  if (date === undefined || date === null) {
    return DASH;
  }

  const secondsDiff = Math.abs(Math.floor((date.getTime() - now.getTime()) / 1000));

  // Less than 60 secs, we show seconds only
  if (secondsDiff < 60) {
    return `${secondsDiff}s`;
  }

  // Less than 60 mins, we show minutes only
  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  }

  // Less than 24 hours, we show hours only
  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) {
    return `${hoursDiff}h`;
  }

  // More than 24 hours, we show days only
  const daysDiff = Math.floor(hoursDiff / 24);
  return `${daysDiff}d`;
}

export class _IntlDate {
  public readonly locale: string | undefined;

  constructor(locale?: string | undefined) {
    this.locale = locale;
  }

  private toDate(input: Date | string | number): Date | null {
    const date = new Date(input);
    return isNaN(date.valueOf()) ? null : date;
  }

  public toTimezone(
    input: Date | string | number,
    options?: {
      timezone?: string | undefined;
    }
  ): string {
    const date = new Date(input);
    const timeZonePart = new Intl.DateTimeFormat(this.locale, {
      timeZone: options?.timezone,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type == 'timeZoneName');
    return timeZonePart ? timeZonePart.value : '';
  }

  public format(
    inputDate: Date | string | number,
    options?: {
      timezone?: string | undefined;
      withoutDate?: boolean | undefined;
      withoutTime?: boolean | undefined;
      withoutSeconds?: boolean | undefined;
      withoutYear?: boolean | undefined;
      withTimezone?: boolean | undefined;
      hour12?: boolean | undefined;
    }
  ): string {
    const date = this.toDate(inputDate);
    if (date === null) {
      return DASH;
    }
    const datePart = date.toLocaleDateString(this.locale, {
      timeZone: options?.timezone,
      day: 'numeric',
      month: 'short',
      year: options?.withoutYear ? undefined : 'numeric',
      timeZoneName: options?.withoutTime
        ? options?.withTimezone
          ? 'short'
          : undefined
        : undefined,
    });
    const timePart = date.toLocaleTimeString(this.locale, {
      timeZone: options?.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: options?.withoutSeconds ? undefined : '2-digit',
      timeZoneName: options?.withTimezone ? 'short' : undefined,
      hour12: options?.hour12,
    });
    return options?.withoutDate
      ? timePart
      : options?.withoutTime
        ? datePart
        : `${datePart} ${timePart}`;
  }
}

export const intlDate = new _IntlDate();
