export default function FormTitle({ isResultsShown }: { isResultsShown: boolean }) {
    
  return (
     <div className={`flex justify-center items-center`}>
        <div 
          className={`${isResultsShown ? 'text-[42px] leading-[42px]' : 'text-[96px] leading-[96px]'} font-jerse text-[#FAFE00] flex ${isResultsShown ? 'flex-row' : 'flex-col'}`}
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
