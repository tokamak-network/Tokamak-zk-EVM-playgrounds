export const DOCKER_NAME = "tokamak-zk-evm";

export const DOCKER_DOWNLOAD_URL =
  "https://pub-30801471f84a46049e31eea6c3395e00.r2.dev/docker-images/tokamak-zk-evm.tar";
export const FILE_NAME = "tokamak-zk-evm.tar";

export const getEnvVars = async () => {
  if (window.env) {
    return await window.env.getEnvVars();
  }
};
