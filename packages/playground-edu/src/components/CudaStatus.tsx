import React from "react";
import { useCuda } from "../hooks/useCuda";

interface CudaStatusProps {
  className?: string;
}

export const CudaStatus: React.FC<CudaStatusProps> = ({ className = "" }) => {
  const { cudaStatus, refreshCudaStatus } = useCuda();

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? "text-green-500" : "text-red-500";
  };

  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? "✅" : "❌";
  };

  if (cudaStatus.isLoading) {
    return (
      <div className={`p-4 border rounded-lg bg-gray-50 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>CUDA 지원 상태를 확인 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">CUDA 지원 상태</h3>
        <button
          onClick={refreshCudaStatus}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          새로고침
        </button>
      </div>

      {cudaStatus.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          <strong>오류:</strong> {cudaStatus.error}
        </div>
      )}

      <div className="space-y-3">
        {/* 전체 CUDA 지원 상태 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">전체 CUDA 지원</span>
          <span className={`${getStatusColor(cudaStatus.isFullySupported)} font-semibold`}>
            {getStatusIcon(cudaStatus.isFullySupported)} {cudaStatus.isFullySupported ? "지원됨" : "지원되지 않음"}
          </span>
        </div>

        {/* NVIDIA GPU */}
        <div className="flex items-center justify-between p-3 border-l-4 border-blue-200">
          <div>
            <span className="font-medium">NVIDIA GPU</span>
            {cudaStatus.gpu.gpuInfo && (
              <div className="text-sm text-gray-600 mt-1">{cudaStatus.gpu.gpuInfo}</div>
            )}
            {cudaStatus.gpu.error && (
              <div className="text-sm text-red-500 mt-1">{cudaStatus.gpu.error}</div>
            )}
          </div>
          <span className={getStatusColor(cudaStatus.gpu.isAvailable)}>
            {getStatusIcon(cudaStatus.gpu.isAvailable)}
          </span>
        </div>

        {/* CUDA 컴파일러 */}
        <div className="flex items-center justify-between p-3 border-l-4 border-green-200">
          <div>
            <span className="font-medium">CUDA 컴파일러 (nvcc)</span>
            {cudaStatus.compiler.version && (
              <div className="text-sm text-gray-600 mt-1">버전: {cudaStatus.compiler.version}</div>
            )}
            {cudaStatus.compiler.error && (
              <div className="text-sm text-red-500 mt-1">{cudaStatus.compiler.error}</div>
            )}
          </div>
          <span className={getStatusColor(cudaStatus.compiler.isAvailable)}>
            {getStatusIcon(cudaStatus.compiler.isAvailable)}
          </span>
        </div>

        {/* Docker CUDA 지원 */}
        <div className="flex items-center justify-between p-3 border-l-4 border-purple-200">
          <div>
            <span className="font-medium">Docker CUDA 지원</span>
            {cudaStatus.dockerCuda.error && (
              <div className="text-sm text-red-500 mt-1">{cudaStatus.dockerCuda.error}</div>
            )}
          </div>
          <span className={getStatusColor(cudaStatus.dockerCuda.isSupported)}>
            {getStatusIcon(cudaStatus.dockerCuda.isSupported)}
          </span>
        </div>
      </div>

      {/* 권장 사항 */}
      {!cudaStatus.isFullySupported && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <strong>권장 사항:</strong>
          <ul className="mt-2 text-sm list-disc list-inside space-y-1">
            {!cudaStatus.gpu.isAvailable && (
              <li>NVIDIA GPU 드라이버를 설치하거나 업데이트하세요.</li>
            )}
            {!cudaStatus.compiler.isAvailable && (
              <li>CUDA Toolkit을 설치하세요. (https://developer.nvidia.com/cuda-toolkit)</li>
            )}
            {!cudaStatus.dockerCuda.isSupported && (
              <li>Docker Desktop에서 GPU 지원을 활성화하거나 nvidia-docker를 설치하세요.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CudaStatus; 