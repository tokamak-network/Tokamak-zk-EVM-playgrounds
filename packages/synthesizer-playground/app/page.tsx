'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import ResultDisplay from '@/components/ResultDisplay';
import CustomLoading from '@/components/CustomLoading';
import CustomErrorTab from '@/components/CustomErrorTab';
import Stars from '@/components/Stars';
import RainbowImage from '@/components/RainbowImage';

export default function Home() {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data returned from the server
  const [storageLoad, setStorageLoad] = useState<any[]>([]);
  const [placementLogs, setPlacementLogs] = useState<any[]>([]);
  const [storageStore, setStorageStore] = useState<any[]>([]);
  const [evmContractAddress, setEvmContractAddress] = useState<string>('');
  const [serverData, setServerData] = useState<{
    permutation: string | null;
    placementInstance: string | null;
  } | null>(null);

  const [activeTab, setActiveTab] = useState('storageLoad');

  const processTransaction = async (txId: string) => {
    try {
      setIsProcessing(true);
      setStatus('Processing transaction on the server...');

      // Clear old data
      setStorageLoad([]);
      setPlacementLogs([]);
      setStorageStore([]);
      setServerData(null);

      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionHash: txId }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error || 'Unknown server error.');
      }

      const {
        to,
        logs,
        storageLoad,
        storageStore,
        permutation,
        placementInstance,
      } = json.data;

      setEvmContractAddress(to);
      setPlacementLogs(logs || []);
      setStorageLoad(storageLoad || []);
      setStorageStore(storageStore || []);
      setServerData({
        permutation: JSON.stringify(permutation),
        placementInstance: JSON.stringify(placementInstance),
      });

      setStatus(null);
      sessionStorage.removeItem('pendingTransactionId');
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      sessionStorage.removeItem('pendingTransactionId');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reload pending tx if user refreshes
  useEffect(() => {
    const pendingTxId = sessionStorage.getItem('pendingTransactionId');
    if (pendingTxId) {
      setTransactionId(pendingTxId);
      processTransaction(pendingTxId);
    }
  }, []);

  const handleSubmit = () => {
    if (isProcessing) return;
    sessionStorage.setItem('pendingTransactionId', transactionId);
    window.location.reload();
  };

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0">
        <Stars />
        <RainbowImage />
      </div>
      
      <div className="relative z-10">
        <Header 
          logo="/assets/logo.svg"
          onLogoClick={() => window.location.reload()} 
        />
        
        <TransactionForm
          transactionHash={transactionId}
          setTransactionHash={setTransactionId}
          handleSubmit={handleSubmit}
          isProcessing={isProcessing}
          error={status?.startsWith('Error')}
        />

        {isProcessing ? (
          <CustomLoading />
        ) : status && status.startsWith('Error') ? (
          <CustomErrorTab errorMessage={status.replace('Error: ', '')} />
        ) : null}

        {!isProcessing &&
          (storageLoad.length > 0 ||
            placementLogs.length > 0 ||
            storageStore.length > 0 ||
            serverData) && (
            <ResultDisplay
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              storageLoad={storageLoad}
              placementLogs={placementLogs}
              storageStore={storageStore}
              evmContractAddress={evmContractAddress}
              serverData={serverData}
              handleDownload={() => {}}
            />
          )}
      </div>
    </main>
  );
}