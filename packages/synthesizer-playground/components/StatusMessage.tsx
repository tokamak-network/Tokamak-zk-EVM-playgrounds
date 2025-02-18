interface StatusMessageProps {
  message: string;
  type: 'error' | 'loading';
}

const StatusMessage = ({ message, type }: StatusMessageProps) => {
  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          to { 
            transform: rotate(360deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
          }
        }

        .loading-spinner {
          animation: spin 1s steps(8) infinite;
        }

        .loading-spinner::before {
          content: "";
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 4px solid #00ffff;
          animation: glow 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className={`w-4/5 max-w-[600px] mx-auto my-5 p-0 font-['Press_Start_2P'] text-sm text-center relative
        ${type === 'error' ? 'bg-[#000033] border-4 border-[#4466ff] text-[#99aaff] shadow-[inset_0_0_10px_rgba(68,102,255,0.3),0_0_20px_rgba(68,102,255,0.2)]' : ''}`}
      >
        {type === 'error' ? (
          <>
            <div className="bg-gradient-to-b from-[#0000ac] to-[#333344] text-[#ff2727] p-2.5 text-base m-0 border-b-4 border-[#4466ff]">
              ERROR!
            </div>
            <div className="text-[50px] p-2.5 text-[#ccccdd] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] border-t-2 border-[#333366]">
              {message}
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center items-center my-5">
            <div className="w-16 h-16 border-8 border-[#000033] border-t-[#00ffff] relative loading-spinner" />
          </div>
        )}
      </div>
    </>
  );
};

export default StatusMessage; 