/**
 * Agent Service - Handles AI agent simulation and message generation
 * 
 * This service encapsulates all agent-related logic, providing a clean interface
 * for agent interactions and removing this complexity from the main App component.
 */

import { AgentMessage, ConceptDesignState, NodeObject } from '../types';
import { createLLMService } from '../llm/utils/factory';

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
  private llmService;
  private knowledgeBase: string = "Knowledge base content will be loaded dynamically";
  private isLoadingKnowledgeBase: boolean = false;

  /**
   * Initialize the agent service with a message callback
   * @param messageCallback - Function to call when agents generate messages
   */
  constructor(messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void) {
    this.messageCallback = messageCallback;
    this.llmService = createLLMService();

    // Load knowledge base in the background
    this.loadKnowledgeBase();
  }
  
  /**
   * Load the knowledge base content from file
   */
  private loadKnowledgeBase() {
    if (this.isLoadingKnowledgeBase) return;
    this.isLoadingKnowledgeBase = true;
    
    try {
      // List of all knowledge graph files to load
      const kgFiles = [
        'mechanisms.md',
        'materials.md',
        'methods.md',
        'phenomena.md',
        'applications.md',
        'theoretical.md',
        'vectors.md',
        'css.md',
        'merged_ISM.md'
      ];
      
      // Load all files sequentially
      this.loadKnowledgeFiles(kgFiles)
        .then(() => {
          console.log("Complete knowledge graph loaded successfully");
          this.isLoadingKnowledgeBase = false;
        })
        .catch(error => {
          console.error("Error loading knowledge base:", error);
          this.isLoadingKnowledgeBase = false;
        });
    } catch (error) {
      console.error("Error in loadKnowledgeBase:", error);
      this.isLoadingKnowledgeBase = false;
    }
  }

  /**
   * Load multiple knowledge files sequentially
   * @param files - Array of file names to load
   */
  private async loadKnowledgeFiles(files: string[]): Promise<void> {
    this.knowledgeBase = ""; // Reset knowledge base
    
    for (const file of files) {
      try {
        const path = file === 'merged_ISM.md' ? `/KG/${file}` : `/KG/${file}`;
        const response = await fetch(path);
        
        if (!response.ok) {
          console.warn(`Failed to load knowledge file ${file}: ${response.status}`);
          continue;
        }
        
        const content = await response.text();
        if (content) {
          // Add file header and content to knowledge base
          this.knowledgeBase += `\n\n# KNOWLEDGE FILE: ${file}\n\n${content}`;
          console.log(`Loaded knowledge file: ${file} (${Math.round(content.length / 1024)} KB)`);
        }
      } catch (error) {
        console.error(`Error loading knowledge file ${file}:`, error);
      }
    }
    
    console.log(`Total knowledge base size: ${Math.round(this.knowledgeBase.length / 1024)} KB`);
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
    // For actions that should use real LLM, call the appropriate method
    if (this.shouldUseLLM(action)) {
      return this.getLLMResponse(action, payload, conceptState, graphData);
    }
    
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
   * Determine if an action should use real LLM
   */
  private shouldUseLLM(action: string): boolean {
    const llmActions = [
      'suggest-compatible-components',
      'find-analogies',
      'check-consistency',
      'generate-protocol-outline',
      'generate-concept-summary',
      'launch-exploratory-analysis'
    ];
    
    return llmActions.includes(action);
  }

  /**
   * Get response from LLM for agent actions
   */
  private getLLMResponse(
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): AgentResponse {
    // Create initial response message
    const initialMessage = this.createInitialMessage(action, payload, conceptState);
    
    // Prepare to make LLM call
    this.callLLMAsync(action, payload, conceptState, graphData)
      .then(llmContent => {
        // Send follow-up message with LLM response
        const followUpMessage = this.createFollowUpMessage(action, llmContent, conceptState);
        this.messageCallback(followUpMessage);
      })
      .catch(error => {
        // Send error message if LLM call fails
        this.messageCallback({
          sourceAgent: this.getAgentForAction(action),
          type: 'error',
          content: `Error generating response: ${error.message}`
        });
      });
    
    // Return initial response
    return { message: initialMessage };
  }

  /**
   * Create initial message for LLM-based actions
   */
  private createInitialMessage(
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState
  ): Omit<AgentMessage, 'id' | 'timestamp'> {
    const agentName = this.getAgentForAction(action);
    let content = '';
    
    switch (action) {
      case 'suggest-compatible-components':
        content = `Analyzing current design to suggest compatible components...`;
        break;
      case 'find-analogies':
        content = `Searching for analogous concepts and patterns...`;
        break;
      case 'check-consistency':
        content = `Validating design consistency and compatibility...`;
        break;
      case 'generate-protocol-outline':
        content = `Generating experimental protocol outline...`;
        break;
      case 'generate-concept-summary':
        content = `Creating comprehensive concept summary...`;
        break;
      case 'launch-exploratory-analysis':
        content = `Initiating exploratory analysis of knowledge graph...`;
        break;
      default:
        content = `Processing ${action}...`;
    }
    
    return {
      sourceAgent: agentName,
      type: 'info',
      content
    };
  }

  /**
   * Create follow-up message with LLM response
   */
  private createFollowUpMessage(
    action: string,
    llmContent: string,
    conceptState?: ConceptDesignState
  ): Omit<AgentMessage, 'id' | 'timestamp'> {
    const agentName = this.getAgentForAction(action);
    
    // Create a summary of the content for the message
    const contentSummary = this.createContentSummary(llmContent, action);
    
    // Create appropriate action payload for viewing in new window
    let messageAction = {
      type: 'view-llm-result',
      label: 'View Full Analysis',
      payload: {}
    };
    
    // Customize action based on action type
    switch (action) {
      case 'generate-protocol-outline':
        messageAction = {
          type: 'view-llm-result',
          label: 'View Full Protocol',
          payload: {
            title: `Protocol: ${conceptState?.objective || 'New Concept'}`,
            content: llmContent,
            protocolGenerated: true,
            protocol: llmContent,
            conceptId: conceptState?.id
          }
        };
        break;
        
      case 'generate-concept-summary':
        messageAction = {
          type: 'view-llm-result',
          label: 'View Full Summary',
          payload: {
            title: `Summary: ${conceptState?.objective || 'New Concept'}`,
            content: llmContent,
            summaryGenerated: true,
            fullSummary: llmContent
          }
        };
        break;
        
      case 'check-consistency':
        messageAction = {
          type: 'view-llm-result',
          label: 'View Full Analysis',
          payload: {
            title: `Consistency Analysis: ${conceptState?.objective || 'New Concept'}`,
            content: llmContent
          }
        };
        break;
        
      case 'find-analogies':
        messageAction = {
          type: 'view-llm-result',
          label: 'View Full Analysis',
          payload: {
            title: `Analogical Analysis: ${conceptState?.objective || 'New Concept'}`,
            content: llmContent
          }
        };
        break;
        
      case 'launch-exploratory-analysis':
        messageAction = {
          type: 'view-llm-result',
          label: 'View Full Analysis',
          payload: {
            title: 'Exploratory Analysis',
            content: llmContent
          }
        };
        break;
        
      case 'suggest-compatible-components':
        messageAction = {
          type: 'view-llm-result',
          label: 'View All Suggestions',
          payload: {
            title: `Component Suggestions: ${conceptState?.objective || 'New Concept'}`,
            content: llmContent
          }
        };
        break;
        
      default:
        messageAction = {
          type: 'view-llm-result',
          label: 'View Full Result',
          payload: {
            title: 'LLM Analysis',
            content: llmContent
          }
        };
    }
    
    return {
      sourceAgent: agentName,
      type: 'info',
      content: contentSummary,
      action: messageAction
    };
  }
  
  /**
   * Create a summary of the LLM content for display in the agent message
   */
  private createContentSummary(content: string, action: string): string {
    // Extract the first section or a limited number of characters
    const maxLength = 300;
    
    // Try to find the first heading and extract content until the next heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    const firstHeading = headingMatch ? headingMatch[0] : '';
    
    let summary = '';
    
    if (firstHeading) {
      // Include the first heading
      summary = firstHeading + '\n\n';
      
      // Find the content after the first heading until the next heading or end
      const contentAfterHeading = content.substring(content.indexOf(firstHeading) + firstHeading.length);
      const nextHeadingIndex = contentAfterHeading.search(/^#/m);
      
      if (nextHeadingIndex !== -1) {
        summary += contentAfterHeading.substring(0, nextHeadingIndex).trim();
      } else {
        summary += contentAfterHeading.substring(0, maxLength);
        if (contentAfterHeading.length > maxLength) {
          summary += '...';
        }
      }
    } else {
      // If no heading found, just take the first part of the content
      summary = content.substring(0, maxLength);
      if (content.length > maxLength) {
        summary += '...';
      }
    }
    
    // Add a note about viewing the full result
    summary += `\n\n*Click "View Full ${this.getActionResultName(action)}" to see the complete analysis in a new window.*`;
    
    return summary;
  }
  
  /**
   * Get a user-friendly name for the action result
   */
  private getActionResultName(action: string): string {
    switch (action) {
      case 'generate-protocol-outline': return 'Protocol';
      case 'generate-concept-summary': return 'Summary';
      case 'check-consistency': return 'Analysis';
      case 'find-analogies': return 'Analysis';
      case 'launch-exploratory-analysis': return 'Analysis';
      case 'suggest-compatible-components': return 'Suggestions';
      default: return 'Result';
    }
  }

  /**
   * Make async LLM call
   */
  private async callLLMAsync(
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): Promise<string> {
    // Build prompt based on action type
    const prompt = this.buildPrompt(action, payload, conceptState, graphData);
    
    try {
      // Make LLM call
      const response = await this.llmService.generateText({
        userPrompt: prompt,
        config: {
          temperature: this.getTemperatureForAction(action),
          maxTokens: this.getMaxTokensForAction(action)
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }
      
      return response.content;
    } catch (error) {
      console.error(`Error in LLM call for ${action}:`, error);
      throw error;
    }
  }

  /**
   * Build prompt for LLM based on action type
   */
  private buildPrompt(
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): string {
    // Get the prompt template
    const promptTemplate = this.getBuiltInPrompt(action);
    
    // Add knowledge base context to all prompts
    let prompt = `KNOWLEDGE BASE CONTEXT:\n${this.getRelevantKnowledgeExcerpt(action, conceptState)}\n\n`;
    
    // Add the prompt template with variables replaced
    prompt += this.replacePromptVariables(promptTemplate, action, payload, conceptState, graphData);
    
    return prompt;
  }

  /**
   * Load prompt from file and replace variables
   */
  private async loadPromptFromFile(
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): Promise<string> {
    try {
      // Determine which prompt file to load
      let promptFileName = '';
      switch (action) {
        case 'suggest-compatible-components':
          promptFileName = 'suggest-compatible-components';
          break;
        case 'find-analogies':
          promptFileName = 'find-analogies';
          break;
        case 'check-consistency':
          promptFileName = 'check-consistency';
          break;
        case 'generate-protocol-outline':
          promptFileName = 'generate-protocol-outline';
          break;
        case 'generate-concept-summary':
          promptFileName = 'generate-concept-summary';
          break;
        case 'launch-exploratory-analysis':
          promptFileName = 'launch-exploratory-analysis';
          break;
        default:
          return `Please provide a response for the action: ${action}`;
      }
      
      // Try to load the prompt from file
      let promptTemplate = '';
      try {
        const response = await fetch(`/prompts/${promptFileName}.txt`);
        if (response.ok) {
          promptTemplate = await response.text();
        } else {
          console.warn(`Failed to load prompt file: ${promptFileName}.txt`);
          // Fall back to built-in prompts
          promptTemplate = this.getBuiltInPrompt(action);
        }
      } catch (error) {
        console.error(`Error loading prompt file: ${error}`);
        // Fall back to built-in prompts
        promptTemplate = this.getBuiltInPrompt(action);
      }
      
      // Replace variables in the prompt
      return this.replacePromptVariables(promptTemplate, action, payload, conceptState, graphData);
    } catch (error) {
      console.error(`Error in loadPromptFromFile: ${error}`);
      return `Please provide a response for the action: ${action}`;
    }
  }

  /**
   * Replace variables in prompt template
   */
  private replacePromptVariables(
    promptTemplate: string,
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): string {
    let prompt = promptTemplate;
    
    // Replace concept state variables
    if (conceptState) {
      prompt = prompt.replace(/\{objective\}/g, conceptState.objective || 'Not specified');
      prompt = prompt.replace(/\{materials\}/g, conceptState.components.materials.join(', ') || 'None specified');
      prompt = prompt.replace(/\{mechanisms\}/g, conceptState.components.mechanisms.join(', ') || 'None specified');
      prompt = prompt.replace(/\{methods\}/g, conceptState.components.methods.join(', ') || 'None specified');
      prompt = prompt.replace(/\{theoretical_concepts\}/g, conceptState.components.theoretical_concepts?.join(', ') || 'None specified');
    }
    
    // Replace target node variables for exploratory analysis
    if (action === 'launch-exploratory-analysis' && payload) {
      const targetId = payload.targetId || 'current concept';
      const targetNode = graphData?.nodes.find(n => n.id === targetId);
      
      prompt = prompt.replace(/\{targetId\}/g, targetId);
      prompt = prompt.replace(/\{targetNodeType\}/g, targetNode?.type || 'Unknown');
      prompt = prompt.replace(/\{targetNodeLabel\}/g, targetNode?.label || targetId);
      prompt = prompt.replace(/\{targetNodeDescription\}/g, targetNode?.description || 'No description available');
    }
    
    return prompt;
  }

  /**
   * Get relevant excerpt from knowledge base
   */
  private getRelevantKnowledgeExcerpt(action: string, conceptState?: ConceptDesignState): string {
    // Return the entire knowledge base for all prompts
    if (!this.knowledgeBase || this.knowledgeBase.length < 100) {
      return "Knowledge base is still loading. Please wait a moment and try again.";
    }
    
    // For very large knowledge bases, we might need to truncate
    const maxLength = 100000; // 100KB max to avoid token limits
    if (this.knowledgeBase.length > maxLength) {
      return this.knowledgeBase.substring(0, maxLength) + 
        "\n\n[Knowledge base truncated due to size. Full knowledge base is available but exceeds token limits.]";
    }
    
    return this.knowledgeBase;
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
    
    // This method is now handled by the LLM integration
    // The initial message is created by createInitialMessage
    // and the follow-up with results is created by createFollowUpMessage
    
    // For backward compatibility, return a basic response
    return { 
      message: { 
        sourceAgent: 'Protocol Agent', 
        type: 'info', 
        content: `Processing protocol generation for '${conceptId}'...` 
      } 
    };
  }

  /**
   * Handle summary delivery - generates and delivers the actual summary
   */
  private handleDeliverSummary(payload?: AgentActionPayload, conceptState?: ConceptDesignState): AgentResponse {
    const conceptId = conceptState?.objective || conceptState?.id || 'current concept';
    
    // This method is now handled by the LLM integration
    // The initial message is created by createInitialMessage
    // and the follow-up with results is created by createFollowUpMessage
    
    // For backward compatibility, return a basic response
    return { 
      message: { 
        sourceAgent: 'ConceptAgent', 
        type: 'info', 
        content: `Processing summary generation for '${conceptId}'...` 
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