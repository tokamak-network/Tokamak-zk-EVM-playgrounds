import { NextRequest, NextResponse } from 'next/server';
import { SynthesizerAdapter } from '@tokamak-zk-evm/synthesizer';
import { fetchTransactionBytecode } from '../../../utils/etherscanApi';

// Initialize adapter for each request instead of globally
export async function POST(request: Request) {
  try {
    const { transactionHash } = await request.json();
    
    if (!transactionHash) {
      return NextResponse.json({ ok: false, error: 'No transaction hash provided' }, { status: 400 });
    }

    // Fetch transaction data from Etherscan
    const { bytecode, from, to } = await fetchTransactionBytecode(transactionHash);
    
    // Create new adapter instance for each request
    const adapter = new SynthesizerAdapter();
    const result = await adapter.parseTransaction({
      contractAddr: to,
      calldata: bytecode,
      sender: from,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error: unknown) {
    console.error('Synthesis error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}