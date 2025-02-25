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
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const json = await response.json();
      console.log('Server response:', json);
      
      if (!json.ok) {
        throw new Error(json.error || 'Unknown server error.');
      }

      // Extract data from server response
      const { to, logs, storageLoad, storageStore, permutation, placementInstance } = json.data;
      
      console.log('Processing storageLoad:', storageLoad);
      console.log('Processing logs:', logs);
      console.log('Processing storageStore:', storageStore);

      // Transform logs data
      const transformedLogs = logs?.map((log: any) => {
        const topics = Array.isArray(log.topics) ? log.topics : [];
        return {
          topics: topics.map((topic: string) => topic.startsWith('0x') ? topic : `0x${topic}`),
          valueDec: log.value?.toString() || log.valueDec?.toString() || '0',
          valueHex: log.valueHex?.startsWith('0x') ? log.valueHex : `0x${log.valueHex || '0'}`
        };
      }) || [];

      // Transform storage load data
      const transformedStorageLoad = storageLoad?.map((item: any) => {
        const contractAddr = item.contractAddress || to || '';
        const key = typeof item.key === 'string' ? item.key : (item.key?.toString() || '');
        const value = item.value?.toString() || '0';
        const valueHex = item.valueHex || '';
        
        return {
          contractAddress: contractAddr.startsWith('0x') ? contractAddr : `0x${contractAddr}`,
          key: key.startsWith('0x') ? key : `0x${key}`,
          valueDecimal: value,
          valueHex: valueHex.startsWith('0x') ? valueHex : `0x${valueHex}`
        };
      }) || [];

      // Transform storage store data
      const transformedStorageStore = storageStore?.map((item: any) => {
        const isArray = Array.isArray(item);
        const contractAddr = isArray ? (item[0] || to) : (item.contractAddress || to);
        const key = isArray ? item[1] : item.key;
        const value = isArray ? item[2] : item.value;
        const valueHex = isArray ? item[3] : item.valueHex;

        return {
          contractAddress: contractAddr.startsWith('0x') ? contractAddr : `0x${contractAddr}`,
          key: typeof key === 'string' && key.startsWith('0x') ? key : `0x${key || ''}`,
          value: value?.toString() || '0',
          valueHex: valueHex?.startsWith('0x') ? valueHex : `0x${valueHex || '0'}`
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

  return (
    <>
      <div className="background-container">
        <Stars />
        <RainbowImage />
      </div>
      <div className="container mx-auto p-4">
        <Header 
          logo="/assets/logo.svg" 
          onLogoClick={() => window.location.reload()} 
          isResultsShown={!!(storageLoad.length > 0 || storageStore.length > 0 || placementLogs.length > 0)}
        />
        <TransactionForm
          transactionHash={transactionId}
          setTransactionHash={setTransactionId}
          handleSubmit={handleSubmit}
          isProcessing={isProcessing}
          error={status?.startsWith('Error')}
          isResultsShown={!!(storageLoad.length > 0 || storageStore.length > 0 || placementLogs.length > 0)}
        />
        {status?.startsWith('Error') && (
          <div className="p-4 mt-4 bg-red-800 rounded-lg text-white">
            <p className="text-sm">{status}</p>
          </div>
        )}
        {isProcessing ? (
          <CustomLoading />
        ) : (
          <div>
            {status && status.startsWith('Error') && (
              <CustomErrorTab errorMessage={status.replace('Error: ', '')} />
            )}
            
            {/* Show results if we have any data */}
            {(storageLoad.length > 0 || 
              storageStore.length > 0 || 
              placementLogs.length > 0 || 
              evmContractAddress || 
              serverData?.permutation || 
              serverData?.placementInstance) && (
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
            )}
          </div>
        )}
      </div>
    </>
  );
}