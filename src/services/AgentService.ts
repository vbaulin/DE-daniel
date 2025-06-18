import { GraphData, NodeObject, CSSVector } from '../types';
import { generateMockSuggestions, generateMockProtocol } from '../utils/graphUtils';

export interface AgentMessage {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  content: string;
  data?: any;
}

export interface AgentAction {
  type: string;
  payload?: any;
}

export class AgentService {
  private messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;

  constructor(messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void) {
    this.messageCallback = messageCallback;
  }

  /**
   * Trigger an agent action
   * @param action - The action to perform
   * @param context - Additional context data
   */
  async triggerAgent(action: AgentAction, context?: { 
    conceptState?: Partial<CSSVector>; 
    graphData?: GraphData; 
    fieldPath?: string 
  }): Promise<void> {
    try {
      this.messageCallback({
        type: 'info',
        content: `Processing agent action: ${action.type}`,
        data: action
      });

      switch (action.type) {
        case 'generate-idea':
          await this.handleGenerateIdea(action.payload, context);
          break;
        
        case 'suggest-improvements':
          await this.handleSuggestImprovements(context);
          break;
        
        case 'generate-protocol':
          await this.handleGenerateProtocol(context);
          break;
        
        default:
          this.messageCallback({
            type: 'warning',
            content: `Unknown agent action: ${action.type}`
          });
      }
    } catch (error) {
      this.messageCallback({
        type: 'error',
        content: `Agent action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { action, error }
      });
    }
  }

  private async handleGenerateIdea(payload: any, context?: { 
    conceptState?: Partial<CSSVector>; 
    graphData?: GraphData; 
    fieldPath?: string 
  }): Promise<void> {
    const fieldPath = payload?.field || context?.fieldPath;
    
    // Simulate AI idea generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockIdeas = {
      'context.material_primary': ['Bio-hybrid Hydrogel', 'Liquid Crystal Elastomer', 'Conductive Polymer'],
      'dynamics.mechanism_primary': ['Electrochemical Switching', 'Phase Transition', 'Molecular Recognition'],
      'interface.input_mechanism': ['Optical Stimulation', 'Magnetic Field', 'Chemical Gradient'],
      'interface.output_mechanism': ['Fluorescence Change', 'Mechanical Deformation', 'Electrical Signal'],
      'memory.mechanism_primary': ['Structural Hysteresis', 'Chemical State', 'Topological Memory']
    };

    const ideas = mockIdeas[fieldPath as keyof typeof mockIdeas] || ['Novel Concept A', 'Novel Concept B'];
    
    this.messageCallback({
      type: 'success',
      content: `Generated ${ideas.length} novel ideas for ${fieldPath}`,
      data: { fieldPath, ideas }
    });
  }

  private async handleSuggestImprovements(context?: { 
    conceptState?: Partial<CSSVector>; 
    graphData?: GraphData 
  }): Promise<void> {
    if (!context?.conceptState || !context?.graphData) {
      this.messageCallback({
        type: 'warning',
        content: 'Insufficient context for generating improvements'
      });
      return;
    }

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = generateMockSuggestions(context.conceptState, context.graphData);
    
    this.messageCallback({
      type: 'success',
      content: `Generated ${suggestions.length} improvement suggestions`,
      data: { suggestions }
    });
  }

  private async handleGenerateProtocol(context?: { 
    conceptState?: Partial<CSSVector> 
  }): Promise<void> {
    if (!context?.conceptState) {
      this.messageCallback({
        type: 'warning',
        content: 'No concept state available for protocol generation'
      });
      return;
    }

    // Simulate protocol generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const protocol = generateMockProtocol(context.conceptState);
    
    this.messageCallback({
      type: 'success',
      content: 'Generated experimental protocol',
      data: { protocol }
    });
  }

  /**
   * Get suggestions for a specific field
   * @param fieldPath - The field path to get suggestions for
   * @param conceptState - Current concept state
   * @param graphData - Graph data for context
   */
  getSuggestions(fieldPath: string, conceptState: Partial<CSSVector>, graphData: GraphData) {
    const allSuggestions = generateMockSuggestions(conceptState, graphData);
    return allSuggestions.find(s => s.fieldPath === fieldPath)?.suggestions || [];
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