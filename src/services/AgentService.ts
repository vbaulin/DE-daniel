/**
 * Agent Service - Handles AI agent simulation and message generation
 * 
 * This service encapsulates all agent-related logic, providing a clean interface
 * for agent interactions and removing this complexity from the main App component.
 */

import { AgentMessage, ConceptDesignState, NodeObject } from '../types';
import { createLLMService } from '../llm/utils/factory';
import { loadPrompt } from '../utils/promptUtils';

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
  private prompts: Record<string, string> = {};

  /**
   * Initialize the agent service with a message callback
   * @param messageCallback - Function to call when agents generate messages
   */
  constructor(messageCallback: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void) {
    this.messageCallback = messageCallback;
    this.llmService = createLLMService();

    // Load knowledge base in the background
    this.loadKnowledgeBase();
    
    // Load prompts
    this.loadPrompts();
  }
  
  /**
   * Load the knowledge base content from file
   */
  private loadKnowledgeBase() {
    if (this.isLoadingKnowledgeBase) return;
    this.isLoadingKnowledgeBase = true;
    
    try {
      fetch('/KG/mechanisms.md')
        .then(response => {
          if (!response.ok) {
            console.warn(`Failed to load mechanisms knowledge base: ${response.status}`);
            return fetch('/KG/materials.md');
          }
          return response.text();
        })
        .then(content => {
          if (content) {
            this.knowledgeBase = content;
            console.log("Knowledge base loaded successfully from mechanisms.md");
          } else {
            return fetch('/KG/materials.md');
          }
        })
        .then(response => {
          if (!response || !response.ok) return null;
          return response.text();
        })
        .then(content => {
          if (content) {
            this.knowledgeBase += "\n\n" + content;
            console.log("Additional knowledge loaded from materials.md");
          }
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
   * Load prompts from files
   */
  private async loadPrompts() {
    try {
      // Define the prompts to load
      const promptTypes = [
        'suggest-compatible-components',
        'find-analogies',
        'check-consistency',
        'generate-protocol-outline',
        'generate-concept-summary',
        'launch-exploratory-analysis'
      ];
      
      // Load each prompt
      for (const promptType of promptTypes) {
        try {
          const promptText = await loadPrompt(promptType);
          if (promptText) {
            this.prompts[promptType] = promptText;
            console.log(`Loaded prompt: ${promptType}`);
          }
        } catch (error) {
          console.warn(`Failed to load prompt for ${promptType}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading prompts:", error);
    }
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
    
    // Create appropriate action payload based on the action type
    let messageAction;
    if (action === 'generate-protocol-outline') {
      messageAction = {
        type: 'view-llm-result',
        label: 'View Protocol',
        payload: {
          protocolGenerated: true,
          protocol: llmContent,
          conceptId: conceptState?.id,
          title: `Protocol: ${conceptState?.objective || 'New Concept'}`
        }
      };
    } else if (action === 'generate-concept-summary') {
      messageAction = {
        type: 'view-llm-result',
        label: 'View Full Summary',
        payload: {
          summaryGenerated: true,
          fullSummary: llmContent,
          title: `Summary: ${conceptState?.objective || 'New Concept'}`
        }
      };
    } else if (action === 'check-consistency' || action === 'find-analogies' || action === 'suggest-compatible-components' || action === 'launch-exploratory-analysis') {
      messageAction = {
        type: 'view-llm-result',
        label: 'View Full Analysis',
        payload: {
          content: llmContent,
          title: `${this.getActionTitle(action)}: ${conceptState?.objective || 'Analysis'}`
        }
      };
    }
    
    return {
      sourceAgent: agentName,
      type: 'info', 
      content: this.createSummaryFromLLMContent(llmContent, action),
      action: messageAction
    };
  }

  /**
   * Create a summary from LLM content for display in the agent console
   */
  private createSummaryFromLLMContent(content: string, action: string): string {
    // Extract a summary from the content based on action type
    const lines = content.split('\n');
    let summary = '';
    
    // For protocol and summary, show a brief message with a link to view the full content
    if (action === 'generate-protocol-outline' || action === 'generate-concept-summary') {
      return `${this.getActionTitle(action)} completed successfully. Click below to view the full content.`;
    }
    
    // For other actions, extract key points
    const maxLines = 5;
    const keyPoints: string[] = [];
    
    // Look for headings and bullet points
    for (const line of lines) {
      if (line.startsWith('##') || line.startsWith('- ') || line.startsWith('* ')) {
        keyPoints.push(line);
        if (keyPoints.length >= maxLines) break;
      }
    }
    
    if (keyPoints.length > 0) {
      summary = `${this.getActionTitle(action)} completed. Key points:\n\n${keyPoints.join('\n')}\n\nClick below to view the full analysis.`;
    } else {
      // If no key points found, use the first few lines
      summary = `${this.getActionTitle(action)} completed. Preview:\n\n${lines.slice(0, 3).join('\n')}\n\n...Click below to view the full content.`;
    }
    
    return summary;
  }

  /**
   * Get a human-readable title for an action
   */
  private getActionTitle(action: string): string {
    switch (action) {
      case 'suggest-compatible-components':
        return 'Component Suggestions';
      case 'find-analogies':
        return 'Analogy Analysis';
      case 'check-consistency':
        return 'Consistency Check';
      case 'generate-protocol-outline':
        return 'Protocol Generation';
      case 'generate-concept-summary':
        return 'Concept Summary';
      case 'launch-exploratory-analysis':
        return 'Exploratory Analysis';
      default:
        return action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
    // Check if we have a stored prompt for this action
    const storedPrompt = this.prompts[action];
    
    // Start with the stored prompt or a default
    let prompt = storedPrompt ? storedPrompt : '';
    
    // Add relevant knowledge base excerpt
    prompt += `KNOWLEDGE BASE CONTEXT:\n${this.getRelevantKnowledgeExcerpt(action, conceptState)}\n\n`;
    
    // If we don't have a stored prompt, use the built-in ones
    if (!storedPrompt) {
      switch (action) {
        case 'suggest-compatible-components':
          prompt += this.buildSuggestComponentsPrompt(conceptState);
          break;
        case 'find-analogies':
          prompt += this.buildFindAnalogiesPrompt(conceptState);
          break;
        case 'check-consistency':
          prompt += this.buildCheckConsistencyPrompt(conceptState);
          break;
        case 'generate-protocol-outline':
          prompt += this.buildGenerateProtocolPrompt(conceptState);
          break;
        case 'generate-concept-summary':
          prompt += this.buildGenerateSummaryPrompt(conceptState);
          break;
        case 'launch-exploratory-analysis':
          prompt += this.buildExploratoryAnalysisPrompt(payload, graphData);
          break;
        default:
          prompt += `Please provide a response for the action: ${action}`;
      }
    }
    
    // Add context information regardless of prompt source
    prompt = this.addContextToPrompt(prompt, action, payload, conceptState, graphData);
    
    return prompt;
  }

  /**
   * Add context information to the prompt
   */
  private addContextToPrompt(
    prompt: string,
    action: string,
    payload?: AgentActionPayload,
    conceptState?: ConceptDesignState,
    graphData?: { nodes: NodeObject[] }
  ): string {
    // Replace placeholders in the prompt with actual values
    if (conceptState) {
      prompt = prompt.replace(/\{objective\}/g, conceptState.objective || 'Not specified');
      prompt = prompt.replace(/\{materials\}/g, conceptState.components.materials.join(', ') || 'None specified');
      prompt = prompt.replace(/\{mechanisms\}/g, conceptState.components.mechanisms.join(', ') || 'None specified');
      prompt = prompt.replace(/\{methods\}/g, conceptState.components.methods.join(', ') || 'None specified');
      prompt = prompt.replace(/\{theoretical_concepts\}/g, conceptState.components.theoretical_concepts.join(', ') || 'None specified');
    }
    
    if (payload) {
      prompt = prompt.replace(/\{targetId\}/g, payload.targetId || 'current concept');
      prompt = prompt.replace(/\{goalText\}/g, payload.goalText || 'Not specified');
      
      // Add target node information if available
      if (payload.targetId && graphData) {
        const targetNode = graphData.nodes.find(n => n.id === payload.targetId);
        if (targetNode) {
          prompt = prompt.replace(/\{targetNodeType\}/g, targetNode.type || 'Unknown');
          prompt = prompt.replace(/\{targetNodeLabel\}/g, targetNode.label || targetNode.id);
          prompt = prompt.replace(/\{targetNodeDescription\}/g, targetNode.description || 'No description available');
        }
      }
    }
    
    return prompt;
  }

  /**
   * Get relevant excerpt from knowledge base
   */
  private getRelevantKnowledgeExcerpt(action: string, conceptState?: ConceptDesignState): string {
    // In a real implementation, this would extract relevant sections from the knowledge base
    // based on the action and concept state
    
    // For now, return a brief excerpt
    if (!this.knowledgeBase || this.knowledgeBase === "Knowledge base content will be loaded dynamically") {
      return "Knowledge base is still loading or unavailable. Using default context.";
    }
    
    // Extract a relevant portion based on action and concept state
    let searchTerms: string[] = [];
    
    if (action === 'suggest-compatible-components' && conceptState?.components) {
      searchTerms = [...conceptState.components.materials, ...conceptState.components.mechanisms];
    } else if (action === 'check-consistency') {
      searchTerms = ['consistency', 'compatibility', 'validation'];
    } else if (action === 'generate-protocol-outline') {
      searchTerms = ['protocol', 'experiment', 'procedure', 'validation'];
    } else if (action === 'generate-concept-summary') {
      searchTerms = ['summary', 'concept', 'overview'];
    }
    
    // Simple search for relevant content
    let relevantExcerpt = "Relevant knowledge base excerpt:";
    const knowledgeChunks = this.knowledgeBase.split('\n\n').slice(0, 50);
    
    for (const term of searchTerms) {
      if (!term) continue;
      
      for (const chunk of knowledgeChunks) {
        if (chunk.toLowerCase().includes(term.toLowerCase())) {
          relevantExcerpt += "\n\n" + chunk;
          break;
        }
      }
    }
    
    // Limit excerpt length
    if (relevantExcerpt.length > 1000) {
      relevantExcerpt = relevantExcerpt.substring(0, 1000) + "...";
    }
    
    return relevantExcerpt;
  }

  /**
   * Build prompt for suggesting compatible components
   */
  private buildSuggestComponentsPrompt(conceptState?: ConceptDesignState): string {
    if (!conceptState) return "Please suggest compatible components for a new concept.";
    
    return `You are an expert research assistant helping to design a scientific concept.

CURRENT CONCEPT:
Objective: ${conceptState.objective || 'Not specified'}

Current Materials: ${conceptState.components.materials.join(', ') || 'None specified'}
Current Mechanisms: ${conceptState.components.mechanisms.join(', ') || 'None specified'}
Current Methods: ${conceptState.components.methods.join(', ') || 'None specified'}

TASK:
Suggest 3-5 additional compatible components (materials, mechanisms, or methods) that would enhance this concept.
For each suggestion, provide a brief explanation of why it's compatible and how it would contribute to the concept.

FORMAT YOUR RESPONSE AS:
1. [Component Name]: [Brief explanation of compatibility and contribution]
2. [Component Name]: [Brief explanation of compatibility and contribution]
...`;
  }

  /**
   * Build prompt for finding analogies
   */
  private buildFindAnalogiesPrompt(conceptState?: ConceptDesignState): string {
    if (!conceptState) return "Please find analogies for a new concept.";
    
    return `You are an expert research assistant helping to identify analogies for a scientific concept.

CURRENT CONCEPT:
Objective: ${conceptState.objective || 'Not specified'}

Current Materials: ${conceptState.components.materials.join(', ') || 'None specified'}
Current Mechanisms: ${conceptState.components.mechanisms.join(', ') || 'None specified'}
Current Methods: ${conceptState.components.methods.join(', ') || 'None specified'}

TASK:
Identify 2-3 analogous systems or concepts from different domains that share similar principles, structures, or behaviors.
For each analogy, explain the similarities and how insights from the analogous system might inform the current concept.

FORMAT YOUR RESPONSE AS:
1. [Analogy Name]: [Description of similarities and potential insights]
2. [Analogy Name]: [Description of similarities and potential insights]
...`;
  }

  /**
   * Build prompt for checking consistency
   */
  private buildCheckConsistencyPrompt(conceptState?: ConceptDesignState): string {
    if (!conceptState) return "Please check the consistency of a new concept.";
    
    return `You are an expert research assistant evaluating the consistency of a scientific concept design.

CURRENT CONCEPT:
Objective: ${conceptState.objective || 'Not specified'}

Current Materials: ${conceptState.components.materials.join(', ') || 'None specified'}
Current Mechanisms: ${conceptState.components.mechanisms.join(', ') || 'None specified'}
Current Methods: ${conceptState.components.methods.join(', ') || 'None specified'}

TASK:
Evaluate the consistency and compatibility of the current concept design.
Identify any potential conflicts, gaps, or inconsistencies between the components.
Provide recommendations for resolving any issues.

FORMAT YOUR RESPONSE AS:
## Consistency Analysis

### Strengths
- [Strength 1]
- [Strength 2]
...

### Potential Issues
- [Issue 1]: [Description and recommendation]
- [Issue 2]: [Description and recommendation]
...

### Overall Assessment
[Overall consistency assessment and recommendations]`;
  }

  /**
   * Build prompt for generating protocol
   */
  private buildGenerateProtocolPrompt(conceptState?: ConceptDesignState): string {
    if (!conceptState) return "Please generate an experimental protocol for a new concept.";
    
    return `You are an expert research scientist creating an experimental protocol for a novel concept.

CURRENT CONCEPT:
Objective: ${conceptState.objective || 'Not specified'}

Materials: ${conceptState.components.materials.join(', ') || 'None specified'}
Mechanisms: ${conceptState.components.mechanisms.join(', ') || 'None specified'}
Methods: ${conceptState.components.methods.join(', ') || 'None specified'}

TASK:
Generate a comprehensive experimental protocol to validate this concept.
Include sections for materials, equipment, procedures, measurements, and analysis.
Provide specific, actionable steps that would allow researchers to test and validate the concept.

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:
# Experimental Protocol: [Concept Name]

## 1. Objective
[Clear statement of the protocol's purpose]

## 2. Materials and Equipment
[List of required materials and equipment]

## 3. Preparation
[Preparation steps]

## 4. Experimental Procedure
[Detailed step-by-step procedure]

## 5. Measurements and Data Collection
[What to measure and how]

## 6. Analysis Methods
[How to analyze the collected data]

## 7. Expected Results
[What results would validate the concept]

## 8. Troubleshooting
[Potential issues and solutions]`;
  }

  /**
   * Build prompt for generating summary
   */
  private buildGenerateSummaryPrompt(conceptState?: ConceptDesignState): string {
    if (!conceptState) return "Please generate a summary for a new concept.";
    
    return `You are an expert research scientist creating a comprehensive summary of a novel concept.

CURRENT CONCEPT:
Objective: ${conceptState.objective || 'Not specified'}

Materials: ${conceptState.components.materials.join(', ') || 'None specified'}
Mechanisms: ${conceptState.components.mechanisms.join(', ') || 'None specified'}
Methods: ${conceptState.components.methods.join(', ') || 'None specified'}
Theoretical Concepts: ${conceptState.components.theoretical_concepts?.join(', ') || 'None specified'}

TASK:
Generate a comprehensive summary of this concept.
Include an abstract, component analysis, technical specifications, and recommendations.
Provide a clear, concise overview that would help researchers understand the concept.

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:
# Concept Summary: [Concept Name]

## Abstract
[Brief overview of the concept]

## Component Analysis
[Analysis of the materials, mechanisms, and methods]

## Technical Specifications
[Technical details and parameters]

## Recommendations
[Suggestions for further development or improvement]`;
  }

  /**
   * Build prompt for exploratory analysis
   */
  private buildExploratoryAnalysisPrompt(
    payload?: AgentActionPayload,
    graphData?: { nodes: NodeObject[] }
  ): string {
    const targetId = payload?.targetId || 'current concept';
    const targetNode = graphData?.nodes.find(n => n.id === targetId);
    
    return `You are an expert research assistant conducting an exploratory analysis of a knowledge graph.

TARGET NODE:
ID: ${targetId}
Type: ${targetNode?.type || 'Unknown'}
Label: ${targetNode?.label || targetId}
Description: ${targetNode?.description || 'No description available'}

TASK:
Analyze the target node and identify potential knowledge gaps, research opportunities, and interesting connections.
Suggest 2-3 specific research directions or questions that could be explored.

FORMAT YOUR RESPONSE AS:
## Exploratory Analysis

### Key Insights
- [Insight 1]
- [Insight 2]
...

### Knowledge Gaps
- [Gap 1]: [Description and research opportunity]
- [Gap 2]: [Description and research opportunity]
...

### Suggested Research Directions
1. [Research direction 1]: [Description and potential impact]
2. [Research direction 2]: [Description and potential impact]
...`;
  }

  /**
   * Get appropriate temperature for LLM based on action
   */
  private getTemperatureForAction(action: string): number {
    switch (action) {
      case 'generate-protocol-outline':
        return 0.3; // More deterministic for structured content
      case 'check-consistency':
        return 0.2; // Very deterministic for analysis
      case 'suggest-compatible-components':
      case 'find-analogies':
        return 0.7; // More creative
      default:
        return 0.5; // Balanced default
    }
  }

  /**
   * Get appropriate max tokens for LLM based on action
   */
  private getMaxTokensForAction(action: string): number {
    switch (action) {
      case 'generate-protocol-outline':
      case 'generate-concept-summary':
        return 3000; // Longer for detailed content
      case 'launch-exploratory-analysis':
        return 2000; // Medium length
      default:
        return 1500; // Default for most responses
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
   * Handle