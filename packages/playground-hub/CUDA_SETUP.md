# CUDA Setup Guide (Optional Performance Enhancement)

This document provides instructions for installing CUDA to accelerate Tokamak-zk-EVM-playground performance on NVIDIA GPUs.

**Note:** CUDA installation is completely optional! The playground works perfectly fine with CPU-only processing - it will just take a bit longer. Only follow this guide if you have an NVIDIA GPU and want faster performance.

## What is CUDA?

CUDA is NVIDIA's technology that allows the GPU (graphics card) to help with computational work, making processes much faster.

### Benefits of CUDA:

- ⚡ **Faster Processing:** GPU-accelerated computations can be 5-10x faster than CPU-only
- 🚀 **Better Experience:** Shorter waiting times during backend phases
- 🔧 **Automatic Detection:** The playground automatically detects and uses CUDA if available

## Prerequisites

### Check if you have an NVIDIA GPU:

- **Windows:** Right-click on desktop → "Display settings" → "Advanced display settings" → Check if NVIDIA GPU is listed
- **Alternative:** Open Device Manager → "Display adapters" → Look for NVIDIA graphics card

If you don't have an NVIDIA GPU, you can skip this entire guide - the playground will work great with your CPU!

## CUDA Installation

### 1. Download CUDA Toolkit:

- Visit [NVIDIA CUDA Downloads](https://developer.nvidia.com/cuda-downloads)
- Select your operating system (Windows -> x86_64 -> version 11 -> exe local)
- Download the CUDA Toolkit installer (recommended: latest stable version)

### 2. Install CUDA:

- Run the downloaded installer (`cuda_X.X.X_windows.exe`)
- Follow the installation wizard (keep default settings)
- The installer will automatically install necessary drivers if needed

### 3. Verify CUDA Installation:

- Open Command Prompt (cmd) or PowerShell
- Type: `nvcc --version`
- If CUDA is installed correctly, you'll see version information
- You may need to restart your computer after installation

## Troubleshooting

### What if CUDA installation fails?

- Don't worry! The playground works perfectly without CUDA
- You can always install CUDA later if you want to try GPU acceleration
- Make sure your NVIDIA drivers are up to date before installing CUDA

### Performance Issues:

- Make sure CUDA is properly installed and GPU acceleration is working
- Close other resource-intensive applications during proving/setup phases
- Check that your NVIDIA drivers are up to date

## Uninstalling CUDA

If you no longer need GPU acceleration:

- **Windows:** Go to `Settings` > `Apps` > `Installed Apps` list, find entries starting with "NVIDIA CUDA" and remove them
- **Alternative:** Use the NVIDIA Control Panel to uninstall CUDA components
- **Note:** Be cautious when removing CUDA, as other GPU-accelerated applications may need it!
- You can always reinstall CUDA later if needed for other applications or future use

## Need Help?

If you encounter issues with CUDA setup, please:

1. Check the [main README](./README.md) for general troubleshooting
2. Report CUDA-specific issues on our [GitHub Issues page](https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/issues) with the "cuda" label
