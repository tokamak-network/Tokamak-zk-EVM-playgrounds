import SynthesizerError from "./SynthesizerError";
import SynthesizerResultModal from "./SynthesizerResultModal";
import ErrorModal from "./ErrorModal";
import DockerModal from "./DockerModal";
import ExitModal from "./ExitModal";
import LoadingModal from "./LoadingModal";
import TransactionInputModal from "./TransactionInputModal";
import SetupResult from "./SetupResult";
import PreprocessResult from "./PreprocessResult";
import ProveResult from "./ProveResult";
import SubmitModal from "./SubmitModal";
import ProveLoadingModal from "./ProveLoadingModal";

export default function PlaygroundModals() {
  return (
    <>
      <TransactionInputModal />
      <DockerModal />
      <ErrorModal />
      <ExitModal />
      <LoadingModal />
      <ProveLoadingModal />
      <SynthesizerError />
      <SynthesizerResultModal />
      <SetupResult />
      <PreprocessResult />
      <ProveResult />
      <SubmitModal />
    </>
  );
}
