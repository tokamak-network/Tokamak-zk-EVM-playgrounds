/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*' // Forward to Express server
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add WebAssembly support
  webpack: (config, { isServer }) => {
    // Allow WebAssembly to be imported
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Add a rule to handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
}

module.exports = nextConfig 