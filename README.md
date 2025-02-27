# Tokamak ZK-EVM Synthesizer Playground

A web-based playground for exploring and visualizing Tokamak ZK-EVM transactions using the Synthesizer library.

## Overview

The Synthesizer Playground is an interactive web application that allows you to:

- Parse and analyze Ethereum transactions
- Visualize storage loads and stores
- Examine transaction logs
- Explore the ZK-EVM execution trace
- Understand the placement indices used in the Synthesizer

This tool is particularly useful for developers working with the Tokamak ZK-EVM ecosystem who need to debug transactions or understand how the Synthesizer processes EVM transactions.

## Features

- **Transaction Analysis**: Enter any Ethereum transaction hash to analyze its execution in the Tokamak ZK-EVM
- **Storage Visualization**: View all storage slots that were read from or written to during transaction execution
- **Log Inspection**: Examine event logs emitted during transaction execution
- **Placement Indices**: Access to the Synthesizer's placement indices for advanced debugging
- **Data Export**: Download execution data for further analysis

## Prerequisites

- Node.js 18.x or higher
- npm
- An Etherscan API key (for fetching transaction data)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tokamak-network/tokamak-zk-evm-playgrounds.git
   cd tokamak-zk-evm-playgrounds/packages/synthesizer-playground
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Etherscan API key:
   ```
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   NEXT_PUBLIC_API_URL=http://localhost:3002
   ```

## Running the Application

The application consists of two parts: a Next.js frontend and an Express server for handling the Synthesizer operations.

1. Start the Express server:
   ```bash
   npm run server
   ```

2. In a separate terminal, start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to use the playground.

## Usage

1. Enter an Ethereum transaction hash in the input field
2. Click "Process Transaction" to analyze the transaction
3. View the results in the tabbed interface:
   - **Storage Load**: Shows all storage slots read during execution
   - **Logs**: Displays event logs emitted during execution
   - **Storage Store**: Shows all storage slots written during execution

## Acknowledgements

- Tokamak Network for the ZK-EVM implementation
- Ethereum Foundation for the EVM specification
- Etherscan for transaction data access
