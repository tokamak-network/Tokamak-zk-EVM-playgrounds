import { useAtom } from "jotai";
import { activeSectionAtom } from "../atoms/pipelineAnimation";

export const usePipelineAnimation = () => {
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);

  return { activeSection, setActiveSection };
};
