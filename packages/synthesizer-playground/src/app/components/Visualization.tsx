'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function Visualization() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Basic D3 setup
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear existing content

    // Add visualization logic here later
  }, []);

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
} 