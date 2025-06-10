/**
 * Testing Utilities
 * 
 * This module provides utilities for testing React components and application logic
 * in the Discovery Engine application.
 */

import { GraphData, NodeObject, LinkObject, ConceptDesignState, AgentMessage } from '../types';

/**
 * Creates mock graph data for testing
 * 
 * @param nodeCount - Number of nodes to create
 * @param linkDensity - Link density (0-1, ratio of actual links to possible links)
 * @returns Mock graph data
 */
export const createMockGraphData = (
  nodeCount: number = 10,
  linkDensity: number = 0.2
): GraphData => {
  const nodes: NodeObject[] = [];
  const links: LinkObject[] = [];

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const nodeTypes = ['Material', 'Mechanism', 'Application', 'TheoreticalConcept'];
    const statuses = ['Validated', 'Proposed', 'Experimental'];
    
    nodes.push({
      id: `node-${i}`,
      type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)] as any,
      label: `Test Node ${i}`,
      description: `This is a test node with ID ${i} created for testing purposes.`,
      origin: 'user_upload',
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      references: [`ref-${i}`],
      sourceFileKey: 'test',
      keywords: [`keyword${i}`, `test`]
    });
  }

  // Create links based on density
  const maxPossibleLinks = (nodeCount * (nodeCount - 1)) / 2;
  const targetLinkCount = Math.floor(maxPossibleLinks * linkDensity);
  const linkTypes = ['related-to', 'EnablesMechanismEdge', 'ComposedOfMaterialEdge', 'UtilizesMethodEdge'];

  for (let i = 0; i < targetLinkCount; i++) {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    let targetIndex = Math.floor(Math.random() * nodeCount);
    
    // Ensure no self-links
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * nodeCount);
    }

    // Check if link already exists
    const linkExists = links.some(link => 
      (link.source === nodes[sourceIndex].id && link.target === nodes[targetIndex].id) ||
      (link.source === nodes[targetIndex].id && link.target === nodes[sourceIndex].id)
    );

    if (!linkExists) {
      links.push({
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        type: linkTypes[Math.floor(Math.random() * linkTypes.length)] as any
      });
    }
  }

  return { nodes, links };
};

/**
 * Creates a mock concept design state for testing
 * 
 * @param overrides - Properties to override in the mock state
 * @returns Mock concept design state
 */
export const createMockConceptDesignState = (
  overrides: Partial<ConceptDesignState> = {}
): ConceptDesignState => {
  return {
    id: 'test-concept',
    objective: 'Test adaptive material system',
    status: 'Proposed',
    components: {
      materials: ['graphene--2d-materials', 'hydrogels-general'],
      mechanisms: ['biological-plasticity-mechanisms', 'energy-flow-dissipation'],
      methods: ['computational-modeling', 'experimental-validation'],
      theoretical_concepts: ['active-inference', 'complexity-theory']
    },
    cssVectorDraft: {
      stimulusType: 'thermal',
      responseType: 'shape-change',
      timeScale: 'seconds',
      reversibility: 'reversible'
    },
    protocolOutline: '# Test Protocol\n\n## Setup\n- Prepare test materials\n\n## Execution\n- Apply stimulus\n- Measure response',
    ...overrides
  };
};

/**
 * Creates mock agent messages for testing
 * 
 * @param count - Number of messages to create
 * @returns Array of mock agent messages
 */
export const createMockAgentMessages = (count: number = 5): AgentMessage[] => {
  const agents = ['Discovery Engine', 'Research Assistant', 'Exploration Agent', 'Consistency Agent'];
  const types: AgentMessage['type'][] = ['info', 'warning', 'suggestion', 'opportunity'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `test-msg-${i}`,
    sourceAgent: agents[Math.floor(Math.random() * agents.length)],
    type: types[Math.floor(Math.random() * types.length)],
    content: `Test message ${i}: This is a mock agent message for testing purposes.`,
    timestamp: Date.now() - (i * 60000), // Messages 1 minute apart
    action: Math.random() > 0.7 ? {
      type: 'explore-node',
      label: `Test Action ${i}`,
      payload: { test: true }
    } : undefined,
    relatedNodeIds: Math.random() > 0.8 ? [`node-${i}`] : undefined
  }));
};

/**
 * Mock functions for testing component interactions
 */
export const createMockHandlers = () => ({
  onNodeSelect: mockFn(),
  onTriggerAgent: mockFn(),
  onUpdateObjective: mockFn(),
  onUpdateComponentSelection: mockFn(),
  onUpdateCssField: mockFn(),
  onSearchInputChange: mockFn(),
  onSearchSubmit: mockFn(),
  onToggleDarkMode: mockFn(),
  onNavigateToWikiSection: mockFn(),
  onSetActiveMode: mockFn(),
  onBreadcrumbNavigate: mockFn(),
  onFilterComplete: mockFn()
});

/**
 * Helper to wait for async operations in tests
 * 
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export const waitFor = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to simulate user interactions
 */
export const simulateUserInteraction = {
  /**
   * Simulates typing in an input field
   */
  type: (element: HTMLInputElement, text: string) => {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },

  /**
   * Simulates clicking an element
   */
  click: (element: HTMLElement) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },

  /**
   * Simulates form submission
   */
  submit: (form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  }
};

/**
 * Utilities for testing graph operations
 */
export const graphTestUtils = {
  /**
   * Finds a node by ID in test graph data
   */
  findNodeById: (graphData: GraphData, id: string): NodeObject | undefined => 
    graphData.nodes.find(node => node.id === id),

  /**
   * Finds links connected to a specific node
   */
  findLinksForNode: (graphData: GraphData, nodeId: string): LinkObject[] => 
    graphData.links.filter(link => 
      link.source === nodeId || link.target === nodeId
    ),

  /**
   * Counts nodes by type
   */
  countNodesByType: (graphData: GraphData): Record<string, number> => {
    const counts: Record<string, number> = {};
    graphData.nodes.forEach(node => {
      const type = node.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  },

  /**
   * Validates graph data structure
   */
  validateGraphStructure: (graphData: GraphData): boolean => {
    const nodeIds = new Set(graphData.nodes.map(node => node.id));
    
    // Check that all links reference existing nodes
    return graphData.links.every(link => {
      return nodeIds.has(link.source) && nodeIds.has(link.target);
    });
  }
};

/**
 * Mock implementations for external dependencies
 */
export const mockImplementations = {
  /**
   * Mock localStorage for testing
   */
  localStorage: {
    store: {} as Record<string, string>,
    getItem: mockFn((key: string) => mockImplementations.localStorage.store[key] || null),
    setItem: mockFn((key: string, value: string) => {
      mockImplementations.localStorage.store[key] = value;
    }),
    removeItem: mockFn((key: string) => {
      delete mockImplementations.localStorage.store[key];
    }),
    clear: mockFn(() => {
      mockImplementations.localStorage.store = {};
    })
  },

  /**
   * Mock fetch for API testing
   */
  fetch: mockFn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('')
    })
  ),

  /**
   * Mock console methods to prevent test output pollution
   */
  console: {
    log: mockFn(),
    warn: mockFn(),
    error: mockFn(),
    group: mockFn(),
    groupEnd: mockFn()
  }
};

/**
 * Test data generators for specific scenarios
 */
export const testDataGenerators = {
  /**
   * Creates graph data with isolated nodes (for testing connectivity)
   */
  createGraphWithIsolatedNodes: (): GraphData => {
    const connectedNodes = createMockGraphData(5, 0.4);
    const isolatedNodes: NodeObject[] = [
      {
        id: 'isolated-1',
        type: 'Material',
        label: 'Isolated Material',
        description: 'An isolated node for testing',
        origin: 'user_upload',
        status: 'Proposed'
      },
      {
        id: 'isolated-2',
        type: 'Mechanism',
        label: 'Isolated Mechanism',
        description: 'Another isolated node for testing',
        origin: 'user_upload',
        status: 'Experimental'
      }
    ];

    return {
      nodes: [...connectedNodes.nodes, ...isolatedNodes],
      links: connectedNodes.links
    };
  },

  /**
   * Creates graph data with circular dependencies
   */
  createGraphWithCircularDependencies: (): GraphData => {
    const nodes: NodeObject[] = [
      { id: 'A', type: 'Material', label: 'Node A', origin: 'user_upload', status: 'Validated' },
      { id: 'B', type: 'Mechanism', label: 'Node B', origin: 'user_upload', status: 'Validated' },
      { id: 'C', type: 'Application', label: 'Node C', origin: 'user_upload', status: 'Validated' }
    ];

    const links: LinkObject[] = [
      { source: 'A', target: 'B', type: 'EnablesMechanismEdge' },
      { source: 'B', target: 'C', type: 'EnablesMechanismEdge' },
      { source: 'C', target: 'A', type: 'ComposedOfMaterialEdge' }
    ];

    return { nodes, links };
  },

  /**
   * Creates large graph data for performance testing
   */
  createLargeGraphData: (nodeCount: number = 1000): GraphData => 
    createMockGraphData(nodeCount, 0.1)
};

/**
 * Custom matchers for testing
 */
export const customMatchers = {
  /**
   * Checks if a graph contains a specific node
   */
  toContainNode: (graphData: GraphData, nodeId: string): boolean => 
    graphData.nodes.some(node => node.id === nodeId),

  /**
   * Checks if a graph contains a specific link
   */
  toContainLink: (graphData: GraphData, sourceId: string, targetId: string): boolean => 
    graphData.links.some(link => {
      return (link.source === sourceId && link.target === targetId) || 
             (link.source === targetId && link.target === sourceId);
    }),

  /**
   * Checks if an agent message has specific properties
   */
  toHaveAgentMessage: (
    messages: AgentMessage[], 
    sourceAgent: string, 
    type: AgentMessage['type']
  ): boolean => 
    messages.some(msg => msg.sourceAgent === sourceAgent && msg.type === type)
};

/**
 * Test environment setup helpers
 */
export const testSetup = {
  /**
   * Sets up mock environment for component testing
   */
  setupMockEnvironment: () => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockImplementations.localStorage
    });

    // Mock console methods
    Object.assign(console, mockImplementations.console);

    // Mock fetch
    global.fetch = mockImplementations.fetch as any;
  },

  /**
   * Cleans up after tests
   */
  cleanup: () => {
    clearAllMocks();
    mockImplementations.localStorage.clear();
  }
};

/**
 * Simple mock function implementation
 */
function mockFn(implementation?: (...args: any[]) => any) {
  const fn = implementation || (() => {});
  fn.mockClear = () => {};
  fn.mockReset = () => {};
  return fn;
}

/**
 * Clear all mocks
 */
function clearAllMocks() {
  // In a real test environment, this would clear Jest mocks
}

// Export a mock jest object for non-test environments
if (typeof jest === 'undefined') {
  global.jest = {
    fn: mockFn,
    clearAllMocks: clearAllMocks
  };
} 