import { atom } from "jotai";

export interface DockerImage {
  name: string;
  size: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  status: string;
}

export const currentDockerContainerAtom = atom<DockerContainer | null>(
  null as DockerContainer
);
