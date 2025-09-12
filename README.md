# Tokamak ZK-EVM Playgrounds

Interactive tools and playgrounds for exploring [the Tokamak ZK-EVM](https://github.com/tokamak-network/Tokamak-zk-EVM/tree/main) ecosystem, focusing on transaction analysis and visualization.

## 📦 Packages

This monorepo contains:

- [playground-hub](./packages/playground-hub) - An interactive desktop application that visualizes the entire Tokamak-zk-EVM proof generation pipeline. It uses Docker to run backend components and provides real-time animations of the process.
- [playground-edu](./packages/playground-edu) - An educational version of the playground hub with a more detailed UI that separates each step of the Tokamak-zk-EVM process. While the interface is more complex, it provides deeper insights into individual stages, making it ideal for learning and understanding the proof generation pipeline.
- [synthesizer-playground](./packages/synthesizer-playground) - A web interface for analyzing Ethereum transactions using the Synthesizer library, providing visualization of:
  - Storage operations (loads and stores)
  - Transaction logs
  - ZK-EVM execution traces
  - Placement indices used in the Synthesizer

## 🚀 Quick Setup

After cloning this repository, run the setup script to configure your development environment:

**Windows (PowerShell - Recommended):**

```powershell
.\setup-dev-env.ps1
```

**Windows (Command Prompt):**

```cmd
.\setup-dev-env.bat
```

**macOS/Linux:**

```bash
chmod +x setup-dev-env.sh
./setup-dev-env.sh
```

This will automatically:

- Configure git hooks for automatic environment setup
- Set up Cursor AI coding rules (English comments only!)
- Install dependencies
- Configure VS Code workspace settings

## 📋 Prerequisites

- Node.js 18.x or higher
- Cursor AI or VS Code (recommended)

## 🔍 Features

- **Transaction Analysis**: Process any Ethereum transaction through the Synthesizer
- **Storage Visualization**: View all storage operations during execution
- **Log Inspection**: Examine transaction event logs
- **ZK-EVM Integration**: Seamless integration with Tokamak's ZK-EVM
- **Developer Tools**: Debug and analyze transaction processing

## 📚 Documentation

- [Synthesizer Documentation](https://tokamak.notion.site/Synthesizer-documentation-164d96a400a3808db0f0f636e20fca24?pvs=4)

## Support

- **Issues**: [GitHub Issues](https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/issues)
- **Community**: [Tokamak ZKP World Discord](https://discord.com/invite/BgtSfggv), [Tokamak ZKP World X](https://x.com/TokamakZKPWorld)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
