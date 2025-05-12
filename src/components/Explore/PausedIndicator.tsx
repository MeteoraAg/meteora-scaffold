import { cn } from '@/lib/utils';

export const PausedIndicator = () => {
  return (
    <div
      className={cn(
        'flex items-center text-xs text-primary gap-1 md:border border-primary/60 md:rounded-xl p-0.5 md:px-2'
      )}
    >
      <span className="iconify ph--pause-circle-fill w-4 h-4" />
      <span className="hidden md:block font-semibold">Paused</span>
    </div>
  );
};
