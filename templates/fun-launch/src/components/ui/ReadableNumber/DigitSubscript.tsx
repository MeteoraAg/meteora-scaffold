import React, { memo } from 'react';
import { DIGIT_SUBSCRIPT_RE, parseSubscript } from '@/lib/format/number';

type DigitSubscriptProps = {
  value: string;
};

/**
 * Renders digit subscripts in text using HTML sub tags
 *
 * @example
 * <DigitSubscript value="123.0₇₇1" /> // renders as 123.0<sub>₇₇</sub>1
 */
export const DigitSubscript = memo(function DigitSubscript({ value }: DigitSubscriptProps) {
  const parts = value.split(DIGIT_SUBSCRIPT_RE);

  return (
    <span translate="no">
      {parts.map((part, i) => {
        const isSubscript = part.match(DIGIT_SUBSCRIPT_RE) !== null;
        return (
          <React.Fragment key={i}>
            {isSubscript ? <sub>{parseSubscript(part)}</sub> : part}
          </React.Fragment>
        );
      })}
    </span>
  );
});
