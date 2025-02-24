const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Enable WASM
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };

    // Add fallbacks for Node.js modules in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        events: require.resolve('eventemitter3'),
      };
    }

    // Update module resolution
    config.resolve.modules = [
      'node_modules',
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, '..', '..', 'node_modules'),
      path.join(__dirname, '..', 'frontend', 'synthesizer', 'src'),
      path.join(__dirname, 'src'),
    ];

    // Add aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ethereumjs/common': path.join(__dirname, '..', 'frontend', 'synthesizer', 'libs', 'common', 'dist', 'esm'),
      '@ethereumjs/statemanager': path.join(__dirname, '..', 'frontend', 'synthesizer', 'libs', 'statemanager', 'dist', 'esm'),
      '@ethereumjs/util': path.join(__dirname, '..', 'frontend', 'synthesizer', 'libs', 'util', 'dist', 'esm'),
      '@ethereumjs/mpt': path.join(__dirname, '..', 'frontend', 'synthesizer', 'libs', 'mpt', 'dist', 'esm'),
      '@ethereumjs/verkle': path.join(__dirname, '..', 'frontend', 'synthesizer', 'libs', 'verkle', 'dist', 'esm'),
      '@frontend': path.join(__dirname, '..', 'frontend'),
      '@synthesizer': path.join(__dirname, '..', 'frontend', 'synthesizer'),
    };

    // Handle extensions
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };

    // Add rules for different file types
    config.module.rules.push(
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
      {
        test: /tsconfig\.json$/,
        loader: 'ignore-loader',
      },
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      }
    );

    return config;
  },
  transpilePackages: [
    '@synthesizer-libs/common',
    '@tokamak-zk-evm/synthesizer',
    'eventemitter3',
    'verkle-cryptography-wasm',
    '@ethereumjs/util'
  ],
};

module.exports = nextConfig;