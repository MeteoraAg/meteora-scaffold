import { useInfiniteQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { BottomPanelTab, bottomPanelTabAtom } from './config';
import { useTokenInfo } from '@/hooks/queries';
import { ReadableNumber } from '../ui/ReadableNumber';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { cn } from '@/lib/utils';
import { TxnsTab } from './TxnsTab';
import { HoldersTab } from './HoldersTab';

type TokenBottomPanelProps = {
  className?: string;
};

export const TokenBottomPanel: React.FC<TokenBottomPanelProps> = memo(({ className }) => {
  const [tab, setTab] = useAtom(bottomPanelTabAtom);

  return (
    <Tabs
      className={cn('overflow-hidden', className)}
      value={tab}
      onValueChange={(value) => setTab(value as BottomPanelTab)}
    >
      <div className="flex items-center justify-between border-b border-neutral-850 pr-2">
        <TabsList className="scrollbar-none flex h-10 w-full items-center text-sm">
          <TabsTrigger value={BottomPanelTab.TXNS}>
            <span className="sm:hidden">{`Txns`}</span>
            <span className="max-sm:hidden">{`Transactions`}</span>
          </TabsTrigger>

          <TabsTrigger value={BottomPanelTab.HOLDERS}>
            <span>{`Holders`}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="contents" value={BottomPanelTab.TXNS}>
        <TxnsTab />
      </TabsContent>

      <TabsContent className="contents" value={BottomPanelTab.HOLDERS}>
        <HoldersTab />
      </TabsContent>
    </Tabs>
  );
});

TokenBottomPanel.displayName = 'TokenBottomPanel';
