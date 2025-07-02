import SynthesizerError from "./SynthesizerError";
import SynthesizerResultModal from "./SynthesizerResultModal";
import ErrorModal from "./ErrorModal";
import DockerModal from "./DockerModal";
import ExitModal from "./ExitModal";
import LoadingModal from "./LoadingModal";
import TransactionInputModal from "./TransactionInputModal";

export default function PlaygroundModals() {
  return (
    <>
      <TransactionInputModal />
      <DockerModal />
      <ErrorModal />
      <ExitModal />
      <LoadingModal />
      <SynthesizerError />
      <SynthesizerResultModal />
    </>
  );
}
