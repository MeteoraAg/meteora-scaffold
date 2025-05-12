import ExploreGrid from './ExploreGrid';
import { DataStreamProvider } from '@/contexts/DataStreamProvider';
import { ExploreMsgHandler } from './ExploreMsgHandler';
import { ExploreProvider } from '@/contexts/ExploreProvider';
import { PropsWithChildren } from 'react';

const Explore = () => {
  return (
    <ExploreContext>
      <div className="py-8">
        <ExploreGrid className="flex-1" />
      </div>
    </ExploreContext>
  );
};

const ExploreContext = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col h-full">
      <ExploreMsgHandler />

      <ExploreProvider>
        <DataStreamProvider>{children}</DataStreamProvider>
      </ExploreProvider>
    </div>
  );
};

export default Explore;
