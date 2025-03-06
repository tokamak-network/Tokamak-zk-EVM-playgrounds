'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import ResultDisplay from '@/components/ResultDisplay';
import CustomLoading from '@/components/CustomLoading';
import CustomErrorTab from '@/components/CustomErrorTab';
import Stars from '@/components/Stars';
import RainbowImage from '@/components/RainbowImage';
import { StorageItem, StorageStoreItem, LogItem, ServerData, ApiResponse } from '@/types/api-types';
import FormTitle from './FormTitle';

// Determine the external API URL from env variable or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function HomePage() {
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessedOnce, setHasProcessedOnce] = useState(false);

  // Data returned from the server
  const [storageLoad, setStorageLoad] = useState<StorageItem[]>([]);
  const [placementLogs, setPlacementLogs] = useState<LogItem[]>([]);
  const [storageStore, setStorageStore] = useState<StorageStoreItem[]>([]);
  const [evmContractAddress, setEvmContractAddress] = useState<string>('');
  const [serverData, setServerData] = useState<ServerData | null>(null);

  const [activeTab, setActiveTab] = useState('storageLoad');

  const processTransaction = async (txId: string) => {
    try {
      setIsProcessing(true);
      setStatus('Processing transaction on the server...');
      console.log('Starting transaction processing:', txId);

      // Clear old data
      setStorageLoad([]);
      setPlacementLogs([]);
      setStorageStore([]);
      setServerData(null);

      // Call the separate Express server
      console.log('Making request to:', `${API_URL}/api/parseTransaction`);
      const response = await fetch(`${API_URL}/api/parseTransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
      
      const json = await response.json() as ApiResponse;
      console.log('Server response:', json);
      
      if (!json.ok) {
        throw new Error(json.error || 'Unknown server error.');
      }

      // Extract data from server response
      if (!json.data) {
        throw new Error('No data returned from server.');
      }

      const { to, logs, storageLoad, storageStore, permutation, placementInstance } = json.data;
      
      console.log('Processing storageLoad:', storageLoad);
      console.log('Processing logs:', logs);
      console.log('Processing storageStore:', storageStore);

      // Transform logs data
      const transformedLogs = logs?.map((log) => {
        const topics = Array.isArray(log.topics) ? log.topics : [];
        return {
          topics: topics.map((topic: string) => topic.startsWith('0x') ? topic : `0x${topic}`),
          valueDec: typeof log.valueDec === 'string' ? log.valueDec : '0',
          valueHex: log.valueHex?.startsWith('0x') ? log.valueHex : `0x${log.valueHex || '0'}`
        };
      }) || [];

      // Transform storage load data
      const transformedStorageLoad = storageLoad?.map((item) => {
        const contractAddr = item.contractAddress || to || '';
        const key = item.key || '';
        const valueDecimal = typeof item.valueDecimal === 'string' ? item.valueDecimal : '0';
        const valueHex = item.valueHex || '';
        
        return {
          contractAddress: contractAddr.startsWith('0x') ? contractAddr : `0x${contractAddr}`,
          key: key.startsWith('0x') ? key : `0x${key}`,
          valueDecimal,
          valueHex: valueHex.startsWith('0x') ? valueHex : `0x${valueHex}`
        };
      }) || [];

      // Transform storage store data
      const transformedStorageStore = storageStore?.map((item) => {
        const contractAddr = item.contractAddress || to || '';
        const key = item.key || '';
        const value = item.value || '0';
        const valueHex = item.valueHex || '';

        return {
          contractAddress: contractAddr.startsWith('0x') ? contractAddr : `0x${contractAddr}`,
          key: key.startsWith('0x') ? key : `0x${key}`,
          value,
          valueHex: valueHex.startsWith('0x') ? valueHex : `0x${valueHex}`
        };
      }) || [];

      console.log('Transformed storageLoad:', transformedStorageLoad);
      console.log('Transformed logs:', transformedLogs);
      console.log('Transformed storageStore:', transformedStorageStore);

      // Set the transformed data to state
      setEvmContractAddress(to ? (to.startsWith('0x') ? to : `0x${to}`) : '');
      setPlacementLogs(transformedLogs);
      setStorageLoad(transformedStorageLoad);
      setStorageStore(transformedStorageStore);
      setServerData({
        permutation: permutation ? JSON.stringify(permutation) : null,
        placementInstance: placementInstance ? JSON.stringify(placementInstance) : null,
      });
      setHasProcessedOnce(true);

      setStatus(null);
      sessionStorage.removeItem('pendingTransactionId');
    } catch (error: Error | unknown) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus(`Error: ${errorMessage}`);
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
    processTransaction(transactionId);
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

  const shouldShowResults = hasProcessedOnce || !!(storageLoad.length > 0 || storageStore.length > 0 || placementLogs.length > 0);

  return (
    <div className='flex flex-col justify-center items-center h-screen overflow-auto pt-[75px] relative'>
   
      {/* This starts component located in the bottom of the page with absolute position */}
      <Stars />
      
        <Header 
          logo="/assets/logo.svg" 
          onLogoClick={() => window.location.reload()} 
          isResultsShown={shouldShowResults}
        />
      <div className="flex flex-1 flex-col justify-center items-center gap-y-[35px]">
        <FormTitle isResultsShown={shouldShowResults} />
        <TransactionForm
          transactionHash={transactionId}
          setTransactionHash={setTransactionId}
          handleSubmit={handleSubmit}
          isProcessing={isProcessing}
          error={status?.startsWith('Error')}
          isResultsShown={shouldShowResults}
        />
        {status?.startsWith('Error') && (
          <div className="p-4 mt-4 bg-red-800 rounded-lg text-white">
            <p className="text-sm">{status}</p>
          </div>
        )}
        {isProcessing  ? (
          <CustomLoading isResultsShown={shouldShowResults} />
        ) : (
          <div>
            {status && status.startsWith('Error') ? (
              <CustomErrorTab errorMessage={status.replace('Error: ', '')} />
            ) : (
              /* Show results if we have any data */
              shouldShowResults && (
                  <ResultDisplay
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    storageLoad={storageLoad}
                    storageStore={storageStore}
                    placementLogs={placementLogs}
                    evmContractAddress={evmContractAddress}
                    handleDownload={handleDownload}
                    serverData={serverData}
                  />
              )
            )}
          </div>
        )}
      </div>
        <div className="w-full mb-[22px] mt-[18px]">
          <RainbowImage />
        </div>
    </div>
  );
}