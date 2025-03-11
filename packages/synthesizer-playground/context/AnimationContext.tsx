"use client"
import React, { createContext, useContext, useState } from 'react';

interface AnimationContextType {
  animationKey: number;
  updateAnimationKey: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [animationKey, setAnimationKey] = useState(0);

  const updateAnimationKey = () => setAnimationKey(prev => prev + 1);

  return (
    <AnimationContext.Provider value={{ animationKey, updateAnimationKey }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};