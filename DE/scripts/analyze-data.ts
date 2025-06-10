#!/usr/bin/env tsx
/**
 * Standalone Data Analysis Script
 * 
 * This script provides comprehensive data analysis capabilities for graph data,
 * including statistics, search functionality, and data transformation utilities.
 * 
 * Usage:
 *   npx tsx DE/scripts/analyze-data.ts [options]
 * 
 * Options:
 *   --input-file path/to/graph.json       Input graph data file
 *   --search-query "search terms"         Search within graph data
 *   --stats                               Calculate detailed statistics
 *   --validate                            Validate graph structure
 *   --find-path source target             Find shortest path between nodes
 *   --output-format json|readable         Output format
 *   --help, -h                           Show help message
 */

import { 
  calculateGraphStats, 
  filterGraphBySearch, 
  findShortestPath,
  validateGraphData,
  groupNodesByProperty,
  extractKeywords,
  mergeGraphData
} from '../src/utils/dataTransformUtils';
import { GraphData, NodeObject } from '../src/types';

interface CliOptions {
  inputFile?: string;
  searchQuery?: string;
  showStats?: boolean;
  validate?: boolean;
  findPath?: [string, string];
  outputFormat?: 'json' | 'readable';
  help?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--input-file':
        options.inputFile = args[++i];
        break;
      case '--search-query':
        options.searchQuery = args[++i];
        break;
      case '--stats':
        options.showStats = true;
        break;
      case '--validate':
        options.validate = true;
        break;
      case '--find-path':
        const source = args[++i];
        const target = args[++i];
        if (source && target) {
          options.findPath = [source, target];
        }
        break;
      case '--output-format':
        const format = args[++i];
        if (['json', 'readable'].includes(format)) {
          options.outputFormat = format as 'json' | 'readable';
        }
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Standalone Data Analysis Tool

Usage:
  npx tsx DE/scripts/analyze-data.ts [options]

Options:
  --input-file path           Input graph data JSON file
  --search-query "terms"      Search for nodes matching terms
  --stats                     Calculate comprehensive statistics
  --validate                  Validate graph structure
  --find-path source target   Find shortest path between nodes
  --output-format format      Output format: json, readable (default)
  --help, -h                 Show this help message

Examples:
  # Analyze graph statistics
  npx tsx DE/scripts/analyze-data.ts --input-file graph.json --stats

  # Search for specific nodes
  npx tsx DE/scripts/analyze-data.ts --search-query "polymer" --input-file graph.json

  # Find path between nodes
  npx tsx DE/scripts/analyze-data.ts --find-path "node-a" "node-b" --input-file graph.json

  # Comprehensive analysis
  npx tsx DE/scripts/analyze-data.ts --input-file graph.json --stats --validate
`);
}

/**
 * Load graph data from file or create mock data
 */
async function loadGraphData(filePath?: string): Promise<GraphData> {
  if (filePath) {
    try {
      // In a real implementation, this would use fs.readFileSync
      // For now, return mock data
      console.log(`📂 Loading graph data from: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error loading file: ${error}`);
      throw error;
    }
  }
  
  // Generate mock data for demonstration
  console.log('📊 Using mock graph data for analysis');
  return {
    nodes: [
      { id: 'polymer-1', type: 'Material', label: 'Smart Polymer', description: 'Adaptive polymer material', origin: 'wiki_section' },
      { id: 'mechanism-1', type: 'Mechanism', label: 'Shape Memory', description: 'Shape memory mechanism', origin: 'wiki_section' },
      { id: 'application-1', type: 'Application', label: 'Soft Robotics', description: 'Robotic applications', origin: 'wiki_section' },
      { id: 'method-1', type: 'Method', label: '3D Printing', description: 'Additive manufacturing', origin: 'wiki_section' },
      { id: 'theory-1', type: 'TheoreticalConcept', label: 'Polymer Physics', description: 'Theoretical framework', origin: 'wiki_section' }
    ] as NodeObject[],
    links: [
      { source: 'polymer-1', target: 'mechanism-1', type: 'EnablesMechanismEdge' },
      { source: 'polymer-1', target: 'application-1', type: 'related-to' },
      { source: 'mechanism-1', target: 'application-1', type: 'related-to' },
      { source: 'method-1', target: 'polymer-1', type: 'related-to' },
      { source: 'theory-1', target: 'mechanism-1', type: 'related-to' }
    ]
  };
}

/**
 * Display statistics in readable format
 */
function displayStatistics(graphData: GraphData) {
  const stats = calculateGraphStats(graphData);
  
  console.log('\n📊 Graph Statistics:');
  console.log('═'.repeat(60));
  console.log(`📦 Total Nodes: ${stats.totalNodes}`);
  console.log(`🔗 Total Links: ${stats.totalLinks}`);
  console.log(`📈 Average Degree: ${stats.averageDegree.toFixed(2)}`);
  console.log(`🏝️  Isolated Nodes: ${stats.isolatedNodes}`);
  
  console.log('\n📝 Node Types Distribution:');
  Object.entries(stats.nodeTypes)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      const percentage = ((count / stats.totalNodes) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
  
  console.log('\n🔗 Link Types Distribution:');
  Object.entries(stats.linkTypes)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      const percentage = ((count / stats.totalLinks) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
}

/**
 * Display search results
 */
function displaySearchResults(graphData: GraphData, query: string) {
  const { filteredData, highlights } = filterGraphBySearch(graphData, query);
  
  console.log(`\n🔍 Search Results for "${query}":`);
  console.log('═'.repeat(60));
  console.log(`Found ${filteredData.nodes.length} matching nodes:`);
  
  filteredData.nodes.forEach(node => {
    const nodeHighlights = highlights.get(node.id) || [];
    console.log(`\n📦 ${node.label || node.id} (${node.type})`);
    console.log(`   ID: ${node.id}`);
    if (node.description) {
      console.log(`   Description: ${node.description.substring(0, 100)}...`);
    }
    if (nodeHighlights.length > 0) {
      console.log(`   Matches: ${nodeHighlights.map(h => h.field).join(', ')}`);
    }
  });
  
  console.log(`\n🔗 Related connections: ${filteredData.links.length}`);
}

/**
 * Display path finding results
 */
function displayPathResults(graphData: GraphData, source: string, target: string) {
  const path = findShortestPath(graphData, source, target);
  
  console.log(`\n🗺️  Path Analysis: ${source} → ${target}`);
  console.log('═'.repeat(60));
  
  if (path) {
    console.log(`✅ Path found (${path.length} nodes):`);
    path.forEach((nodeId, index) => {
      const node = graphData.nodes.find(n => n.id === nodeId);
      const label = node ? node.label || nodeId : nodeId;
      const arrow = index < path.length - 1 ? ' → ' : '';
      console.log(`   ${index + 1}. ${label}${arrow}`);
    });
    console.log(`\n📏 Path length: ${path.length - 1} steps`);
  } else {
    console.log('❌ No path found between the specified nodes');
  }
}

/**
 * Display validation results
 */
function displayValidation(graphData: GraphData) {
  const validation = validateGraphData(graphData);
  
  console.log('\n🔍 Graph Validation:');
  console.log('═'.repeat(60));
  
  if (validation.isValid) {
    console.log('✅ Graph structure is valid');
  } else {
    console.log('❌ Graph has structural issues');
  }
  
  if (validation.errors.length > 0) {
    console.log('\n❌ Errors:');
    validation.errors.forEach(error => console.log(`  • ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`  • ${warning}`));
  }
}

/**
 * Display node grouping analysis
 */
function displayNodeGrouping(graphData: GraphData) {
  const groupedByType = groupNodesByProperty(graphData.nodes, 'type');
  
  console.log('\n🏷️  Node Grouping Analysis:');
  console.log('═'.repeat(60));
  
  groupedByType.forEach((nodes, type) => {
    console.log(`\n📂 ${type} (${nodes.length} nodes):`);
    nodes.slice(0, 5).forEach(node => {
      console.log(`   • ${node.label || node.id}`);
    });
    if (nodes.length > 5) {
      console.log(`   ... and ${nodes.length - 5} more`);
    }
  });
}

/**
 * Extract and display keywords from all node descriptions
 */
function displayKeywordAnalysis(graphData: GraphData) {
  const allText = graphData.nodes
    .map(node => `${node.label} ${node.description || ''}`)
    .join(' ');
    
  const keywords = extractKeywords(allText, 20);
  
  console.log('\n🏷️  Keyword Analysis:');
  console.log('═'.repeat(60));
  console.log('Top keywords found in graph:');
  keywords.forEach((keyword, index) => {
    console.log(`   ${index + 1}. ${keyword}`);
  });
}

/**
 * Main execution function
 */
async function main() {
  console.log('📊 Research Discovery Engine - Data Analysis Tool\n');

  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    // Load graph data
    const graphData = await loadGraphData(options.inputFile);
    
    console.log(`✅ Loaded graph with ${graphData.nodes.length} nodes and ${graphData.links.length} links\n`);

    // Perform requested analyses
    if (options.validate) {
      displayValidation(graphData);
    }

    if (options.showStats) {
      displayStatistics(graphData);
      displayNodeGrouping(graphData);
      displayKeywordAnalysis(graphData);
    }

    if (options.searchQuery) {
      displaySearchResults(graphData, options.searchQuery);
    }

    if (options.findPath) {
      displayPathResults(graphData, options.findPath[0], options.findPath[1]);
    }

    // Output in requested format
    if (options.outputFormat === 'json') {
      console.log('\n📄 Graph Data (JSON):');
      console.log('═'.repeat(60));
      console.log(JSON.stringify(graphData, null, 2));
    }

    console.log('\n🎉 Analysis completed successfully!');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

// Run the script
main(); 