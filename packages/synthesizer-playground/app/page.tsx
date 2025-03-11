import PlaygroundClient from '@/components/PlaygroundClient';
import { AnimationProvider } from '@/context/AnimationContext';

export default function Home() {
  return <AnimationProvider>
          <PlaygroundClient />
        </AnimationProvider>;
}