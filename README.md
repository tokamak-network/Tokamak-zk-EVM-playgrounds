# Tokamak zk-EVM Playground

A playground for experimenting with Tokamak zk-EVM, featuring Docker-based execution environment and interactive UI.

## Features

- **Docker Integration**

  - Docker image management through Cloudflare R2
  - Container status monitoring
  - Command execution in Docker environment

- **Interactive UI**

  - Real-time pipeline animation
  - Progress visualization
  - Transaction modal
  - Light/Dark theme support

- **Backend Operations**
  - Setup trusted setup
  - Pre-process transactions
  - Prove transactions
  - Verify proofs

## Prerequisites

- Node.js (v16 or higher)
- Docker Desktop
- Cloudflare R2 credentials (for Docker image download)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/Tokamak-zk-EVM-playgrounds.git
cd Tokamak-zk-EVM-playgrounds
```

2. Install dependencies:

```bash
npm install
```

3. Set up your API key:
   - Open the application
   - Navigate to settings
   - Enter your API key

## Usage

1. **Start the Application**

```bash
npm start
```

2. **Docker Image Setup**

   - The application will automatically check for the required Docker image
   - If not present, it will download from Cloudflare R2

3. **Running Transactions**
   - Enter transaction details in the transaction modal
   - Follow the pipeline animation for progress
   - View results in the UI

## Development

### Project Structure

```
packages/
  ├── playground-hub/     # Main application
  ├── playground-ui/      # UI components
  └── playground-core/    # Core functionality
```

### Available Scripts

- `npm start`: Start the development server
- `npm run build`: Build the application
- `npm test`: Run tests
- `npm run lint`: Run linter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Tokamak Network
- Cloudflare R2
- Docker
