# Tokamak ZK-EVM Playgrounds

Interactive tools and playgrounds for exploring [the Tokamak ZK-EVM](https://github.com/tokamak-network/Tokamak-zk-EVM/tree/main) ecosystem, focusing on transaction analysis and visualization.

## 📦 Packages

This monorepo contains:
- [playground-hub](./packages/playground-hub) - An interactive desktop application that visualizes the entire Tokamak-zk-EVM proof generation pipeline. It uses Docker to run backend components and provides real-time animations of the process.
- [synthesizer-playground](./packages/synthesizer-playground) - A web interface for analyzing Ethereum transactions using the Synthesizer library, providing visualization of:
  - Storage operations (loads and stores)
  - Transaction logs
  - ZK-EVM execution traces
  - Placement indices used in the Synthesizer

## 📋 Prerequisites

- Node.js 18.x or higher
- Etherscan API key (for transaction data)

## 🔍 Features

- **Transaction Analysis**: Process any Ethereum transaction through the Synthesizer
- **Storage Visualization**: View all storage operations during execution
- **Log Inspection**: Examine transaction event logs
- **ZK-EVM Integration**: Seamless integration with Tokamak's ZK-EVM
- **Developer Tools**: Debug and analyze transaction processing

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

## 📚 Documentation

- [Synthesizer Documentation](https://tokamak.notion.site/Synthesizer-documentation-164d96a400a3808db0f0f636e20fca24?pvs=4)
