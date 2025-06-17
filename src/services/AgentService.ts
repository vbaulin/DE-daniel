/**
 * Agent Service - Handles AI agent simulation and message generation
 * 
 * This service encapsulates all agent-related logic, providing a clean interface
 * for agent interactions and removing this complexity from the main App component.
 */

import { AgentMessage, ConceptDesignState, NodeObject } from '../types';

/**
 * Agent action payload interface for type safety
 */
interface AgentActionPayload {
  query?: string;
  nodeId?: string;
  targetId?: string;
  componentId?: string;
  goalText?: string;
  [key: string]: any;
}

/**
 * Agent response interface for structured responses
 */
interface AgentResponse {
  message: Omit<AgentMessage, 'id' | 'timestamp'>;
  delay?: number;
  followUpActions?: Array<{
    action: string;
    delay: number;
    payload?: AgentActionPayload;
  }>;
}

/**
 * AgentService class that handles all agent simulation logic
 */
export class AgentService {
  private messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;

  /**
   * Initialize the agent service with a message callback
   * @param messageCallback - Function to call when agents generate messages
   */
  constructor(messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void) {
    this.messageCallback = messageCallback;
  }

  /**
   * Main entry point for triggering agent actions
   * @param action - The action to trigger
   * @param payload - Additional data for the action
   * @param conceptState - Current concept design state
   * @param graphData - Current graph data
   */
  public triggerAgent(
    action: string, 
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): void {
    const response = this.getAgentResponse(action, payload, conceptState, graphData);
    
    // Send immediate message
    this.messageCallback(response.message);
    
    // Handle follow-up actions with delays
    if (response.followUpActions) {
      response.followUpActions.forEach(followUp => {
        setTimeout(() => {
          this.triggerAgent(followUp.action, followUp.payload, conceptState, graphData);
        }, followUp.delay);
      });
    }
  }

  /**
   * Generate agent response based on action type
   * @param action - The action being performed
   * @param payload - Action payload data
   * @param conceptState - Current concept state
   * @param graphData - Current graph data
   * @returns Agent response configuration
   */
  private getAgentResponse(
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): AgentResponse {
    
    switch (action) {
      case 'search-graph':
        return this.handleSearchGraph(payload);
        
      case 'initiate-new-concept-from-selection':
        return this.handleInitiateConceptFromSelection(payload, graphData);
        
      case 'initiate-new-concept-from-goal':
        return this.handleInitiateConceptFromGoal(payload);
        
      case 'launch-exploratory-analysis':
        return this.handleExploratoryAnalysis(payload, conceptState);
        
      case 'add-component-to-design':
        return this.handleAddComponent(payload);
        
      case 'suggest-compatible-components':
        return this.handleSuggestComponents(conceptState);
        
      case 'find-analogies':
        return this.handleFindAnalogies(conceptState);
        
      case 'check-consistency':
        return this.handleCheckConsistency(conceptState);
        
      case 'generate-protocol-outline':
        return this.handleGenerateProtocol(conceptState);
        
      case 'generate-concept-summary':
        return this.handleGenerateSummary(conceptState);
        
      case 'package-knowledge-artifact':
        return this.handlePackageArtifact(conceptState);
        
      case 'deliver-protocol':
        return this.handleDeliverProtocol(payload, conceptState);
        
      case 'deliver-summary':
        return this.handleDeliverSummary(payload, conceptState);
        
      default:
        return this.handleGenericAction(action, payload);
    }
  }

  /**
   * Handle search graph action
   */
  private handleSearchGraph(payload?: AgentActionPayload): AgentResponse {
    return {
      message: {
        sourceAgent: 'Search Agent',
        type: 'info',
        content: `Searching graph for: "${payload?.query}"...`
      }
    };
  }

  /**
   * Handle concept initiation from node selection
   */
  private handleInitiateConceptFromSelection(
    payload?: AgentActionPayload, 
    graphData?: { nodes: NodeObject[] }
  ): AgentResponse {
    const seedNode = graphData?.nodes.find(n => n.id === payload?.nodeId);
    const nodeName = seedNode ? seedNode.label || seedNode.id : 'a blank state';
    
    return {
      message: {
        sourceAgent: 'Orchestration Agent',
        type: 'info',
        content: `New concept design initiated from ${nodeName}.`
      }
    };
  }

  /**
   * Handle concept initiation from goal
   */
  private handleInitiateConceptFromGoal(payload?: AgentActionPayload): AgentResponse {
    const goalText = payload?.goalText || 'Not specified';
    
    return {
      message: {
        sourceAgent: 'Orchestration Agent',
        type: 'info',
        content: `New concept design initiated with goal: "${goalText}". Orchestration Agent suggesting starting points...`
      },
      followUpActions: [{
        action: 'suggest-starting-points',
        delay: 1500,
        payload: { goalText }
      }]
    };
  }

  /**
   * Handle exploratory analysis
   */
  private handleExploratoryAnalysis(
    payload?: AgentActionPayload, 
    conceptState?: ConceptDesignState
  ): AgentResponse {
    const targetId = payload?.targetId || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Exploration Agent',
        type: 'info',
        content: `Exploration Agents analyzing neighborhood of ${targetId}...`
      },
      followUpActions: [{
        action: 'report-knowledge-gap',
        delay: 2000,
        payload: { targetId }
      }]
    };
  }

  /**
   * Handle adding component to design
   */
  private handleAddComponent(payload?: AgentActionPayload): AgentResponse {
    return {
      message: {
        sourceAgent: 'Orchestration Agent',
        type: 'info',
        content: `Component ${payload?.componentId} added to design.`
      }
    };
  }

  /**
   * Handle suggesting compatible components
   */
  private handleSuggestComponents(conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Exploration Agent',
        type: 'info',
        content: `Searching for compatible components for '${conceptId}'...`
      },
      followUpActions: [{
        action: 'provide-component-suggestion',
        delay: 1800,
        payload: { conceptId }
      }]
    };
  }

  /**
   * Handle finding analogies
   */
  private handleFindAnalogies(conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Analogy Agent',
        type: 'info',
        content: `Searching for analogies related to '${conceptId}'...`
      },
      followUpActions: [{
        action: 'report-analogy',
        delay: 2200,
        payload: { conceptId }
      }]
    };
  }

  /**
   * Handle consistency checking
   */
  private handleCheckConsistency(conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Consistency Agent',
        type: 'info',
        content: `Checking design consistency for '${conceptId}'...`
      },
      followUpActions: [{
        action: 'report-consistency',
        delay: 1000,
        payload: { 
          conceptId,
          materials: conceptState?.components?.materials || [],
          mechanisms: conceptState?.components?.mechanisms || []
        }
      }]
    };
  }

  /**
   * Handle protocol generation
   */
  private handleGenerateProtocol(conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Protocol Agent',
        type: 'info',
        content: `Generating protocol outline for '${conceptId}'...`
      },
      followUpActions: [{
        action: 'deliver-protocol',
        delay: 1500,
        payload: { 
          conceptId,
          materials: conceptState?.components?.materials || [],
          mechanisms: conceptState?.components?.mechanisms || []
        }
      }]
    };
  }

  /**
   * Handle concept summary generation
   */
  private handleGenerateSummary(conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'ConceptAgent',
        type: 'info',
        content: `Generating summary for '${conceptId}'...`
      },
      followUpActions: [{
        action: 'deliver-summary',
        delay: 1000,
        payload: { conceptState }
      }]
    };
  }

  /**
   * Handle knowledge artifact packaging
   */
  private handlePackageArtifact(conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Orchestration Agent',
        type: 'info',
        content: `Packaging Knowledge Artifact for '${conceptId}'...`
      }
    };
  }

  /**
   * Handle protocol delivery - generates and delivers the actual protocol
   */
  private handleDeliverProtocol(payload?: AgentActionPayload, conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = payload?.conceptId || conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'Protocol Agent',
        type: 'info',
        content: `Protocol generation complete for '${conceptId}'. Protocol outline has been generated and is ready for use.`,
        action: {
          type: 'view-details',
          label: 'View Protocol',
          payload: {
            protocolGenerated: true,
            conceptId,
            materials: payload?.materials || conceptState?.components?.materials || [],
            mechanisms: payload?.mechanisms || conceptState?.components?.mechanisms || []
          }
        }
      }
    };
  }

  /**
   * Handle summary delivery - generates and delivers the actual summary
   */
  private handleDeliverSummary(payload?: AgentActionPayload, conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    return {
      message: {
        sourceAgent: 'ConceptAgent',
        type: 'info',
        content: `Concept summary generated for '${conceptId}'. Summary includes component analysis, technical specifications, and recommendations.`,
        action: {
          type: 'view-details',
          label: 'View Summary',
          payload: {
            summaryGenerated: true,
            conceptState: payload?.conceptState || conceptState
          }
        }
      }
    };
  }

  /**
   * Handle generic/unknown actions
   */
  private handleGenericAction(action: string, payload?: AgentActionPayload): AgentResponse {
    return {
      message: {
        sourceAgent: 'Discovery Engine',
        type: 'info',
        content: `Triggered action: ${action}`
      }
    };
  }

  /**
   * Helper method to determine appropriate agent for an action
   * @param action - The action being performed
   * @returns The agent name responsible for this action
   */
  private getAgentForAction(action: string): string {
    if (action.startsWith('search')) return 'Search Agent';
    if (action.startsWith('suggest') || action.startsWith('find-analogies')) return 'Exploration Agent';
    if (action.startsWith('check') || action.startsWith('validate')) return 'Consistency Agent';
    if (action.startsWith('generate-protocol')) return 'Protocol Agent';
    if (action.startsWith('generate-concept') || action.startsWith('package-artifact')) return 'ConceptAgent';
    if (action.startsWith('start-design') || action.startsWith('add-component') || action.startsWith('initiate-new-concept')) return 'Orchestration Agent';
    return 'Discovery Engine';
  }
}

/**
 * Factory function to create an AgentService instance
 * @param messageCallback - Callback function for handling agent messages
 * @returns Configured AgentService instance
 */
export const createAgentService = (
  messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void
): AgentService => {
  return new AgentService(messageCallback);
}; 