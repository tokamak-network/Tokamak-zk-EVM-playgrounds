export default function RainbowImage() {
  return (
    <div 
      className="w-full h-[50px] z-[1000]" 
      style={{ 
        backgroundImage: "url('/assets/rainbow.svg')", 
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center bottom"
      }}
    />
  );
} 