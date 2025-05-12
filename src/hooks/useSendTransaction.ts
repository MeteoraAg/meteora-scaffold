import { useState } from 'react';
import { toast } from 'sonner';
import { useWallet } from '@jup-ag/wallet-adapter';
import { Connection, Keypair, Transaction, sendAndConfirmRawTransaction } from '@solana/web3.js';

type SendTransactionOptions = {
  onSuccess?: (signature: string) => void;
  onError?: (error: string) => void;
  additionalSigners?: Keypair[];
};

export function useSendTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { publicKey, signTransaction } = useWallet();

  const sendTransaction = async (
    transaction: Transaction,
    connection: Connection,
    options: SendTransactionOptions = {}
  ) => {
    if (!publicKey || !signTransaction) {
      const walletError = new Error('Wallet not connected');
      setError(walletError);
      toast.error('Wallet not connected. Please connect your wallet.');
      options.onError?.(walletError.message);
      return null;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      // Prepare transaction

      transaction.feePayer = transaction.feePayer || publicKey;
      if (!transaction.recentBlockhash) {
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }

      // Simulate transaction
      const simulation = await connection.simulateTransaction(transaction);

      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }

      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction);
      if (options.additionalSigners) {
        options.additionalSigners.forEach((signer) => {
          transaction.sign(signer);
        });
      }

      const txSignature = await sendAndConfirmRawTransaction(
        connection,
        signedTransaction.serialize(),
        { commitment: 'confirmed' }
      );

      setSignature(txSignature);
      options.onSuccess?.(txSignature);
      return txSignature;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      options.onError?.(`Transaction failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction,
    isLoading,
    error,
    signature,
  };
}
