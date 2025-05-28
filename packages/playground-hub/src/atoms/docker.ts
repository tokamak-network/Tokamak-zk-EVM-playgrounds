import { atom } from "jotai";

export interface DockerImage {
  name: string;
  size: string;
}

export interface DockerContainer {
  ID: string;
  name: string;
  status: string;
}

export type SupportedDockerImages = "tokamak-zk-evm-tontransfer";

export const currentDockerContainerAtom = atom<DockerContainer | null>(
  null as DockerContainer
);

export const selectedDockerImageAtom = atom<SupportedDockerImages | null>(null);
