import React, { useState } from 'react';

interface TokenFormProps {
  onSubmit: (address: string) => void;
  isProcessing?: boolean;
}

export default function TokenForm({ onSubmit, isProcessing }: TokenFormProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Check Token</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter token address"
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Check
        </button>
      </form>
    </div>
  );
} 