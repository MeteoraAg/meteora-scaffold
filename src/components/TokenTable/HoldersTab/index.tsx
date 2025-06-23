import { memo } from 'react';

import { HolderCount } from './HolderCount';
import { TopHolderCount } from './TopHolderCount';
import { HolderContentTable } from './HolderContent';

export const HoldersTab: React.FC = memo(() => {
  return (
    <>
      <div className="flex items-center justify-between border-b border-neutral-850 p-1 text-xs">
        <HoldersSummary />
      </div>
      <HolderContentTable />
    </>
  );
});

HoldersTab.displayName = 'HoldersTab';

const HoldersSummary: React.FC = () => {
  return (
    <div className="flex items-center gap-2 pl-1">
      <div>
        <span className="text-neutral-500">Holders:</span> <HolderCount />
      </div>
      <div>
        <span className="text-neutral-500">Top 10 holders:</span> <TopHolderCount />
      </div>
    </div>
  );
};
