import { IconProps } from './types';

const CaretUpIcon: React.FC<IconProps> = ({ width = 24, height = 24, ...otherProps }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...otherProps}
    >
      <path d="M8 6.125L12 10.125L4 10.125L8 6.125Z" fill="currentColor" />
    </svg>
  );
};

export default CaretUpIcon;
