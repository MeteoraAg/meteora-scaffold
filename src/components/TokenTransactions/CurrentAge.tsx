import { useCurrentDate } from '@/lib/environment/date';
import { formatAge } from '@/lib/format/date';

type CurrentAgeProps = {
  date: Date;
};

export const CurrentAge: React.FC<CurrentAgeProps> = (props) => {
  // Use date from context to avoid multiple timers
  const now = useCurrentDate();
  const formatted = formatAge(props.date, now);
  return <>{formatted}</>;
};
