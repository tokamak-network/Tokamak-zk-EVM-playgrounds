import dynamic from 'next/dynamic';

// Dynamically import the client component with no SSR for the parts that need client-side functionality
const PlaygroundClient = dynamic(() => import('@/components/PlaygroundClient'), {
  ssr: true,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-pulse text-2xl">Loading Playground...</div>
    </div>
  )
});

// This is a Server Component
export default async function Home() {
  // You can fetch any initial data here
  // const initialData = await fetchSomeData();

  return <PlaygroundClient />;
}
