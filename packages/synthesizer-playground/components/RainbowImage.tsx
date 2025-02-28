export default function RainbowImage() {
  return (
    <div 
      className="w-full h-[50px]" 
      style={{ 
        backgroundImage: "url('/assets/rainbow.svg')", 
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center bottom"
      }}
    />
  );
} 