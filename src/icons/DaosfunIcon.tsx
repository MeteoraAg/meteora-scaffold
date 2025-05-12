import React from 'react';
import { IconProps } from './types';

export const DaosfunIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      width="1em"
      height="1em"
      fill="white"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.077 3.40901L5.764 6.12501L11.042 8.65701C10.542 9.59952 9.79396 10.3875 8.87876 10.936C7.96357 11.4844 6.91594 11.7725 5.849 11.769C2.62 11.77 0 9.18601 0 6.00001C0 2.81401 2.619 0.232007 5.85 0.232007C6.92948 0.228694 7.98889 0.523725 8.91127 1.08453C9.83366 1.64534 10.5831 2.45011 11.077 3.41001V3.40901Z"
      />
    </svg>
  );
};
