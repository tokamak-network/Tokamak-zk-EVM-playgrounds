'use client';

import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';

import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import ResultDisplay from '@/components/ResultDisplay';
import CustomLoading from '@/components/CustomLoading';
import CustomErrorTab from '@/components/CustomErrorTab';
import Stars from '@/components/Stars';
import RainbowImage from '@/components/RainbowImage';

// Determine the external API URL from env variable or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function HomePage() {
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

      // Call the separate Express server
      const response = await fetch(`${API_URL}/api/parseTransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId }),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error || 'Unknown server error.');
      }

      // Extract data from server response
      const { to, logs, storageLoad, storageStore, permutation, placementInstance } = json.data;

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
    } catch (error: any) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
      sessionStorage.removeItem('pendingTransactionId');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reload pending transaction if user refreshes
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

  // Optional file download logic
  const handleDownload = (fileContent: string | null, fileName: string) => {
    if (!fileContent) return;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="background-container">
        <Stars />
        <RainbowImage />
      </div>
      <div className="container mx-auto p-4">
        <Header logo="/assets/logo.svg" onLogoClick={() => window.location.reload()} />
        <TransactionForm
          transactionHash={transactionId}
          setTransactionHash={setTransactionId}
          handleSubmit={handleSubmit}
          isProcessing={isProcessing}
          error={status?.startsWith('Error')}
        />
        {status?.startsWith('Error') && (
          <div className="p-4 mt-4 bg-red-800 rounded-lg text-white">
            <p className="text-sm">{status}</p>
          </div>
        )}
        {isProcessing ? (
          <CustomLoading />
        ) : status && status.startsWith('Error') ? (
          <CustomErrorTab errorMessage={status.replace('Error: ', '')} />
        ) : null}
        {serverData && (
          <ResultDisplay
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            storageLoad={storageLoad}
            placementLogs={placementLogs}
            storageStore={storageStore}
            evmContractAddress={evmContractAddress}
            handleDownload={handleDownload}
            serverData={serverData}
          />
        )}
      </div>
    </>
  );
}