import SpinnerImage from "../../assets/modals/Spinner.svg";

const LoadingSpinner = () => {
  return (
    <div className="w-[24px] h-[24px] relative">
      <img
        src={SpinnerImage}
        alt="Loading..."
        className="w-full h-full absolute top-0 left-0"
        style={{
          transformOrigin: "12px 12px",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
