export const DOCKER_NAME = "tokamak-dev-env";

export const getEnvVars = async () => {
  if (window.env) {
    return await window.env.getEnvVars();
  }
};
