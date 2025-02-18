const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle internal synthesizer imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // External package aliases
      '@ethereumjs/common': path.resolve(__dirname, '../frontend/synthesizer/libs/common/dist/esm'),
      '@ethereumjs/statemanager': path.resolve(__dirname, '../frontend/synthesizer/libs/statemanager/dist/esm'),
      '@ethereumjs/util': path.resolve(__dirname, '../frontend/synthesizer/libs/util/dist/esm'),
      '@ethereumjs/mpt': path.resolve(__dirname, '../frontend/synthesizer/libs/mpt/dist/esm'),
      '@ethereumjs/verkle': path.resolve(__dirname, '../frontend/synthesizer/libs/verkle/dist/esm'),
      '@frontend': path.resolve(__dirname, '../frontend'),
      '@synthesizer': path.resolve(__dirname, '../frontend/synthesizer'),

      // Handle internal .js imports
      './index.js': path.resolve(__dirname, '../frontend/synthesizer/src/index.ts'),
      './types.js': path.resolve(__dirname, '../frontend/synthesizer/src/types.ts'),
      './precompiles/index.js': path.resolve(__dirname, '../frontend/synthesizer/src/precompiles/index.ts'),
    };

    // Handle .js extensions
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };

    // Add module resolution rules
    config.resolve.modules = [
      'node_modules',
      path.resolve(__dirname, '../frontend/synthesizer/src'),
      path.resolve(__dirname, 'src'),
    ];

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext][query]'
      }
    });

    // Ignore tsconfig parsing
    config.module.rules.push({
      test: /tsconfig\.json$/,
      loader: 'ignore-loader'
    });

    return config;
  },
};

module.exports = nextConfig; 