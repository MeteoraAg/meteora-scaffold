import { MutableRefObject, memo, useEffect } from 'react';
import { IChartingLibraryWidget } from '../AdvancedTradingView/charting_library';
import { useWallet } from '@jup-ag/wallet-adapter';

type RefreshMarksProps = {
  isLoaded: boolean;
  widgetRef: MutableRefObject<IChartingLibraryWidget | null>;
};
export const RefreshMarks: React.FC<RefreshMarksProps> = memo(({ isLoaded, widgetRef }) => {
  const { publicKey } = useWallet();
  // Refresh marks on user wallet change

  useEffect(() => {
    if (!isLoaded || widgetRef.current == null) {
      return;
    }
    widgetRef.current.activeChart().clearMarks();
    widgetRef.current.activeChart().refreshMarks();
  }, [publicKey, isLoaded, widgetRef]);
  return null;
});

RefreshMarks.displayName = 'RefreshMarks';
