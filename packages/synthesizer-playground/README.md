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

1. Start the Express server and develop server with a single command:

   ```bash
   npm run start:dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to use the playground.

## Usage

1. Enter an Ethereum transaction hash in the input field
2. Click "Process Transaction" to analyze the transaction
3. View the results in the tabbed interface:
   - **Storage Load**: Shows all storage slots read during execution
   - **Logs**: Displays event logs emitted during execution
   - **Storage Store**: Shows all storage slots written during execution

## 5. How to Use the Program (Brief Introduction) 📖

1. If the program runs successfully, you will see a screen like this.
   ![Program Initial Screen](./assets/images/5-1.png)
2. Click the cloud located under the **EVM Spec.** heading in the top left corner to display a modal screen like this.  
   ![Program Initial Screen](./assets/images/5-2.png)
3. This modal allows you to select one of the various Tokamak-zk-EVM specs supported by the playground. Click the download button to the right of the title to start downloading the Docker image for that spec.
   ![Program Initial Screen](./assets/images/5-3.png)
4. Once the download is complete, the download button icon will change to a check icon, indicating that the image is ready. Clicking the Tokamak-zk-EVM text in this state will proceed to the next step.  
   ![Program Initial Screen](./assets/images/5-4.png)
5. After clicking, the modal will automatically close, and an animation filling the pipeline will start. The animation will stop when it reaches the handle for the next step, and the previously inactive **frontend/qap-compiler** heading will become colored, indicating it is ready for execution.
   ![Program Initial Screen](./assets/images/5-5.png)
6. Let's set up the EVM Transaction in the same flow. Similar to the EVM Spec, click the cloud under the **Ethereum transaction** heading to open a modal. In this modal's input area, you need to enter the hash of an Ethereum transaction that matches the characteristics supported by the previously selected EVM Spec. Go to the [Etherscan page](https://etherscan.io/).
   ![Program Initial Screen](./assets/images/5-6.png)
7. Find a transaction you want to verify through the Tokamak-zk-EVM and copy its hash value using the copy button next to the Transaction Hash.
   ![Program Initial Screen](./assets/images/5-9.png)
8. Paste the copied hash value into the modal's input area. If the transaction hash is provable by the current Tokamak-zk-EVM, the Input button will be activated as follows.
   ![Program Initial Screen](./assets/images/5-10.png)
   8-1. If the copied hash value is incorrect, an error like this will appear, and the Input button will not be activated. For any other issues, the button will also remain inactive, and a message corresponding to the problem will be displayed in the same area.  
   ![Program Initial Screen](./assets/images/5-11.png)
9. When the Input button is activated, click it to close the modal, and an animation similar to the previous one will start. Once the animation is complete, you will see that the handles for both frontend/qap-compiler and frontend/synthesizer are activated. You can execute the activated handles in any order. In this guide, we will execute qap-compiler first.
   ![Program Initial Screen](./assets/images/5-12.png)
10. Once frontend/qap-compiler has finished, you will see that both **frontend/synthesizer** and **backend/setup** are activated. Next, let's run frontend/synthesizer. (For processes that take some time to execute, a loading modal like the one below will appear. When the process is complete, the modal will automatically close, and the animation will continue.)
    ![Program Initial Screen](./assets/images/5-13.png)
    ![Program Loading Screen](./assets/images/5-13-1.png)
11. After frontend/synthesizer finishes, you can infer from the pipelines that **backend/setup** must also be completed. Let's proceed with the only activated part, backend/setup.
    ![Program Initial Screen](./assets/images/5-14.png)
12. Once backend/setup is complete, **backend/prove** is activated. The actual setup process takes a considerable amount of time, but it is already complete within the Docker image you downloaded earlier. Therefore, it runs very quickly inside the playground.
    ![Program Initial Screen](./assets/images/5-15.png)
13. Once backend/setup is complete, both packages required for the final action, Verify, are ready for execution. First, run backend/preprocess.
    ![Program Loading Screen](./assets/images/5-16-1.png)
    ![Program Initial Screen](./assets/images/5-16.png)
14. Next, run backend/prove, and you will see **backend/verify** become activated. By running verify, you can see the final result of how the Ethereum transaction you selected is analyzed by the Tokamak-zk-EVM.
    ![Program Loading Screen](./assets/images/5-17-1.png)
    ![Program Initial Screen](./assets/images/5-17.png)
15. After backend/prove completes, the water tank will change based on the generated proof and its verification result. If the proof was generated correctly and verified successfully, the tank will fill with blue water along with the number **1**, signifying "True". This indicates that the Tokamak-zk-EVM has operated correctly.
    ![Program Initial Screen](./assets/images/5-18.png)
    15-1. If it did not operate correctly or an issue occurred, the tank will fill with white water along with the number 0, signifying "False". In this case, there may be an issue with the Tokamak-zk-EVM, so please report it using Section 6 below!
    ![Result False Screen](./assets/images/5-18-1.png)

## Acknowledgements

- Tokamak Network for the ZK-EVM implementation
- Ethereum Foundation for the EVM specification
- Etherscan for transaction data access
