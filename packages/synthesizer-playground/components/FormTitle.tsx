import { useViewport } from "@/hooks/useMediaView";

export default function FormTitle({ isResultsShown }: { isResultsShown: boolean }) {
    const {isOverBreakpoint} = useViewport()
  return (
     <div className={`flex justify-center items-center`}>
        <div 
          className={`${isResultsShown ? 'text-[42px] leading-[42px]' : isOverBreakpoint ? 'text-[96px] leading-[96px]' : 'text-[70px] leading-[70px]'} font-jerse text-[#FAFE00] flex ${isResultsShown ? 'flex-row' : 'flex-col'}`}
          style={{ 
            textShadow: '0px 2px 0px rgba(161, 117, 16, 1.00)'
          }}
        >
          Synthesizer{' '}
          <span 
            className="text-white"
          >
            Developer Playground
          </span>
        </div>
      </div>
  );
}
