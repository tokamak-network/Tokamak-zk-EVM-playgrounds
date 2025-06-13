import { atom } from "jotai";
import { DOCKER_NAME } from "../constants";

export interface DockerImage {
  name: string;
  size: string;
}

export interface DockerContainer {
  ID: string;
  name: string;
  status: string;
}

export type SupportedDockerImages = typeof DOCKER_NAME;

export const currentDockerContainerAtom = atom<DockerContainer | null>(
  null as DockerContainer
);

export const selectedDockerImageAtom = atom<SupportedDockerImages | null>(null);
