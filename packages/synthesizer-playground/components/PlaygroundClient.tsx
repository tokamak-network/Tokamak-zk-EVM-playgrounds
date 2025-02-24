'use client';

import { useState } from 'react';
import { Buffer } from 'buffer';

import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import ResultDisplay from '@/components/ResultDisplay';
import CustomLoading from '@/components/CustomLoading';
import CustomErrorTab from '@/components/CustomErrorTab';
import Stars from '@/components/Stars';
import RainbowImage from '@/components/RainbowImage';
import TokenForm from './TokenForm';

// Polyfill Buffer for browser
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

interface PlaygroundClientProps {
  synthesizerInitialized: boolean;
  initError?: string;
}

export default function PlaygroundClient({ synthesizerInitialized, initError }: PlaygroundClientProps) {
  const [transactionHash, setTransactionHash] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<{
    from: string;
    to: string;
    logs: Array<{ topics: string[]; valueDec: string; valueHex: string }>;
    storageLoad: any[];
    storageStore: any[];
    permutation: string;
    placementInstance: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(initError || null);

  // Optional token check state
  const [tokenData, setTokenData] = useState<any>(null);

  // Handle transaction synthesis
  const handleSynthesize = async () => {
    setIsProcessing(true);
    setStatus('Processing transaction on server...');
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionHash }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unknown error from server');
      }

      // Update result to match the full API response from route.ts
      setResult({
        from: data.data.from,
        to: data.data.to,
        logs: data.data.logs,
        storageLoad: data.data.storageLoad,
        storageStore: data.data.storageStore,
        permutation: data.data.permutation,
        placementInstance: data.data.placementInstance,
      });
      setStatus(null);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle token check
  const handleTokenCheck = async (address: string) => {
    try {
      const response = await fetch('/api/token-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unknown error during token check');
      }
      setTokenData(data.tokenData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTokenData(null);
    }
  };

  // Show error if synthesizer failed to initialize
  if (!synthesizerInitialized) {
    return (
      <div className="text-red-500">
        Failed to initialize synthesizer: {initError}
      </div>
    );
  }

  return (
    <>
      <div className="background-container">
        <Stars />
        <RainbowImage />
      </div>
      <div className="container mx-auto p-4">
        <Header logo="/assets/logo.svg" onLogoClick={() => window.location.reload()} />
        {/* TransactionForm now only collects the transaction hash */}
        <TransactionForm
          transactionHash={transactionHash}
          setTransactionHash={setTransactionHash}
          handleSubmit={handleSynthesize}
          isProcessing={isProcessing}
          error={status?.startsWith('Error')}
        />
        <TokenForm onSubmit={handleTokenCheck} isProcessing={isProcessing} />
        {error && (
          <div className="p-4 mt-4 bg-red-800 rounded-lg text-white">
            <p className="text-sm">{error}</p>
          </div>
        )}
        {tokenData && (
          <div className="p-4 mt-4 bg-gray-800 rounded-lg text-white">
            <h3 className="text-lg font-bold mb-2">Token Data</h3>
            <p>Address: {tokenData.tokenAddress}</p>
            <p>Balance: {tokenData.balance}</p>
          </div>
        )}
        {isProcessing ? (
          <CustomLoading />
        ) : status && status.startsWith('Error') ? (
          <CustomErrorTab errorMessage={status.replace('Error: ', '')} />
        ) : null}
        {result && (
          <ResultDisplay
            activeTab="result"
            setActiveTab={() => {}}
            storageLoad={result.storageLoad}
            placementLogs={result.logs}  // Updated to use logs from the API
            storageStore={result.storageStore}
            evmContractAddress={result.to}  // Using 'to' as the contract address
            handleDownload={() => {}}
            serverData={result}
          />
        )}
      </div>
    </>
  );
}