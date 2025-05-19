// src/hooks/useGraphData.ts
import { useState, useEffect } from 'react';
import { GraphData } from '../types';
import { buildCNMGraph } from '../utils/cnmBuilder';
import { parseMarkdownToSections } from '../utils/markdownParser';

export const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      console.log("[useGraphData] Starting data load...");
      if (!isMounted) return; // Check before async call
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("[useGraphData] Calling buildCNMGraph...");
        const data = await buildCNMGraph(); // This might throw or return empty
        console.log("[useGraphData] buildCNMGraph completed.", `Nodes: ${data?.nodes?.length}, Links: ${data?.links?.length}`);

        if (!isMounted) return; // Check after async call

        if (data && data.nodes && data.links && data.nodes.length > 0) { // Check for actual nodes
             setGraphData(data);
             setError(null); // Clear previous error on success
             console.log("[useGraphData] Graph data state updated successfully.");
        } else if (data && data.nodes && data.nodes.length === 0) {
             console.error("[useGraphData] buildCNMGraph returned empty node list.");
             setError("Failed to build graph: No nodes generated. Check logs.");
        } else {
             console.error("[useGraphData] buildCNMGraph returned invalid data structure:", data);
             throw new Error("buildCNMGraph returned invalid data structure.");
        }
      } catch (err) {
        console.error('[useGraphData] Error loading graph data:', err);
        if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to build graph data. Check console for details.');
        }
      } finally {
        console.log("[useGraphData] Load attempt finished.");
        if (isMounted) {
            setLoading(false);
        }
      }
    }

    loadData();

    return () => { isMounted = false; console.log("[useGraphData] Component unmounted."); };
  }, []); // Empty dependency array ensures this runs only once on mount

  return { graphData, loading, error, setGraphData };
};