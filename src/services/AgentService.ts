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
    return this.loadPromptFromFile(action, payload, conceptState, graphData);
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
   * Get built-in prompt for fallback
   */
  private getBuiltInPrompt(action: string): string {
    switch (action) {
      case 'suggest-compatible-components':
        return `You are an expert research assistant helping to design a scientific concept.

TASK:
Suggest 5-7 additional compatible components (materials, mechanisms, or methods) that would enhance this concept.
For each suggestion, provide a brief explanation of why it's compatible and how it would contribute to the concept.
Focus on scientifically sound combinations that would work well together.

CURRENT CONCEPT:
Objective: {objective}

Current Materials: {materials}
Current Mechanisms: {mechanisms}
Current Methods: {methods}
Current Theoretical Concepts: {theoretical_concepts}

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:

# Component Suggestions for {objective}

## Suggested Materials
1. **[Material Name]**: [Brief explanation of compatibility and contribution]
2. **[Material Name]**: [Brief explanation of compatibility and contribution]
...

## Suggested Mechanisms
1. **[Mechanism Name]**: [Brief explanation of compatibility and contribution]
2. **[Mechanism Name]**: [Brief explanation of compatibility and contribution]
...

## Suggested Methods
1. **[Method Name]**: [Brief explanation of compatibility and contribution]
2. **[Method Name]**: [Brief explanation of compatibility and contribution]
...

## Suggested Theoretical Frameworks
1. **[Theory Name]**: [Brief explanation of relevance and contribution]
2. **[Theory Name]**: [Brief explanation of relevance and contribution]
...

## Integration Strategy
[Brief paragraph on how these components could be integrated together]

## Potential Challenges
- [Challenge 1]: [Brief description and potential mitigation]
- [Challenge 2]: [Brief description and potential mitigation]
...

Ensure all suggestions are scientifically valid and would work well with the existing components. Provide specific reasons for each suggestion based on physical, chemical, or biological principles as appropriate.`;

      case 'check-consistency':
        return `You are an expert research assistant evaluating the consistency of a scientific concept design.

TASK:
Evaluate the consistency and compatibility of the current concept design.
Identify any potential conflicts, gaps, or inconsistencies between the components.
Provide recommendations for resolving any issues.

CURRENT CONCEPT:
Objective: {objective}

Current Materials: {materials}
Current Mechanisms: {mechanisms}
Current Methods: {methods}
Current Theoretical Concepts: {theoretical_concepts}

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:

# Consistency Analysis for {objective}

## Strengths
- [List the strengths and compatible aspects of the current design]
- [Focus on synergies between materials and mechanisms]
- [Highlight well-matched methods for the concept]

## Potential Issues
- [Issue 1]: [Description and recommendation]
- [Issue 2]: [Description and recommendation]
...

## Compatibility Matrix

| Component | Compatible With | Potential Conflicts |
|-----------|----------------|---------------------|
| [Material/Mechanism] | [List compatible components] | [List potential conflicts] |
| ... | ... | ... |

## Overall Assessment
[Overall consistency assessment and recommendations]

## Next Steps
1. [Specific action to improve consistency]
2. [Another specific action]
...

Remember to be specific about the scientific principles that create compatibility or conflicts between components. Cite relevant physical, chemical, or biological constraints where applicable.`;

      case 'generate-protocol-outline':
        return `You are an expert research scientist creating an experimental protocol for a novel concept.

TASK:
Generate a comprehensive experimental protocol to validate this concept.
Include sections for materials, equipment, procedures, measurements, and analysis.
Provide specific, actionable steps that would allow researchers to test and validate the concept.

CURRENT CONCEPT:
Objective: {objective}

Materials: {materials}
Mechanisms: {mechanisms}
Methods: {methods}
Theoretical Concepts: {theoretical_concepts}

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:

# Experimental Protocol: {objective}

## 1. Objective
[Clear statement of the protocol's purpose, including specific hypotheses to be tested]

## 2. Materials and Equipment

### 2.1 Materials
- [Material 1]: [Specifications, quantity, source/vendor if applicable]
- [Material 2]: [Specifications, quantity, source/vendor if applicable]
...

### 2.2 Equipment
- [Equipment 1]: [Specifications, settings]
- [Equipment 2]: [Specifications, settings]
...

## 3. Safety Considerations
- [Safety precaution 1]
- [Safety precaution 2]
...

## 4. Preparation
[Detailed preparation steps, including any solutions, samples, or setups that must be prepared before the main procedure]

## 5. Experimental Procedure

### 5.1 [Procedure Stage 1]
1. [Step 1]
2. [Step 2]
...

### 5.2 [Procedure Stage 2]
1. [Step 1]
2. [Step 2]
...

## 6. Measurements and Data Collection
- [Measurement 1]: [What to measure, how to measure it, frequency/timing]
- [Measurement 2]: [What to measure, how to measure it, frequency/timing]
...

## 7. Analysis Methods
- [Analysis Method 1]: [Description, purpose, expected outcomes]
- [Analysis Method 2]: [Description, purpose, expected outcomes]
...

## 8. Expected Results
- [Expected Result 1]: [Description, how it validates the concept]
- [Expected Result 2]: [Description, how it validates the concept]
...

## 9. Troubleshooting
- [Potential Issue 1]: [Solution/Workaround]
- [Potential Issue 2]: [Solution/Workaround]
...

## 10. Time Estimation
- Total estimated time: [X hours/days]
- [Stage 1]: [Time estimate]
- [Stage 2]: [Time estimate]
...

## 11. References
- [Reference 1]
- [Reference 2]
...

Be specific about quantities, durations, temperatures, and other parameters. Include control experiments where appropriate. Ensure the protocol is reproducible by other researchers.`;

      case 'generate-concept-summary':
        return `You are an expert research scientist creating a comprehensive summary of a novel concept.

TASK:
Generate a comprehensive summary of this concept.
Include an abstract, component analysis, technical specifications, and recommendations.
Provide a clear, concise overview that would help researchers understand the concept.

CURRENT CONCEPT:
Objective: {objective}

Materials: {materials}
Mechanisms: {mechanisms}
Methods: {methods}
Theoretical Concepts: {theoretical_concepts}

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:

# Concept Summary: {objective}

## Abstract
[Brief overview of the concept in 3-5 sentences, explaining its purpose, key components, and potential significance]

## Component Analysis

### Materials
- **[Material 1]**: [Brief description of role and properties]
- **[Material 2]**: [Brief description of role and properties]
...

### Mechanisms
- **[Mechanism 1]**: [Brief description of function and importance]
- **[Mechanism 2]**: [Brief description of function and importance]
...

### Methods
- **[Method 1]**: [Brief description of application and purpose]
- **[Method 2]**: [Brief description of application and purpose]
...

### Theoretical Foundation
- **[Theory 1]**: [Brief description of relevance]
- **[Theory 2]**: [Brief description of relevance]
...

## Technical Specifications

### System Architecture
[Description of how components interact and are organized]

### Operational Parameters
[Key parameters, constraints, and performance metrics]

### Interface Characteristics
[How the system interacts with its environment or users]

## Recommendations

### Next Steps
- [Specific recommendation for further development]
- [Another specific recommendation]
...

### Research Directions
- [Promising research direction]
- [Another promising research direction]
...

## Keywords
[List 5-10 keywords that capture the essence of the concept]

Ensure the summary is scientifically accurate, technically precise, and accessible to researchers in the field. Use concrete examples where possible and avoid vague generalizations.`;

      case 'find-analogies':
        return `You are an expert research assistant helping to identify analogies for a scientific concept.

TASK:
Identify 3-5 analogous systems or concepts from different domains that share similar principles, structures, or behaviors with the current concept.
For each analogy, explain the similarities and how insights from the analogous system might inform the current concept.
Focus on deep structural analogies rather than superficial similarities.

CURRENT CONCEPT:
Objective: {objective}

Current Materials: {materials}
Current Mechanisms: {mechanisms}
Current Methods: {methods}
Current Theoretical Concepts: {theoretical_concepts}

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:

# Analogical Analysis for {objective}

## Core Principles of Current Concept
- [Identify 3-5 fundamental principles/mechanisms of the current concept]
- [These will serve as the basis for finding analogies]

## Analogous Systems

### 1. [Analogy Name] (Domain: [e.g., Biology, Computing, Economics])
**Key Similarities:**
- [Similarity 1]
- [Similarity 2]
...

**Potential Insights:**
- [How this analogy could inform the current concept]
- [Specific techniques or approaches that could be transferred]

**Limitations of the Analogy:**
- [Where the analogy breaks down]
- [Cautions about over-extending the comparison]

### 2. [Analogy Name] (Domain: [Domain])
...

### 3. [Analogy Name] (Domain: [Domain])
...

## Cross-Cutting Patterns
[Identify patterns that appear across multiple analogies]

## Recommended Applications
1. [Specific way to apply insights from analogy 1]
2. [Specific way to apply insights from analogy 2]
...

Focus on finding analogies that provide non-obvious insights and could lead to innovative approaches for the current concept. Consider analogies from diverse domains including biology, physics, computer science, economics, and social systems.`;

      case 'launch-exploratory-analysis':
        return `You are an expert research assistant conducting an exploratory analysis of a knowledge graph.

TASK:
Analyze the target node and identify potential knowledge gaps, research opportunities, and interesting connections.
Suggest 3-5 specific research directions or questions that could be explored.
Identify patterns, anomalies, or unexplored areas in the current knowledge representation.

TARGET NODE:
ID: {targetId}
Type: {targetNodeType}
Label: {targetNodeLabel}
Description: {targetNodeDescription}

FORMAT YOUR RESPONSE AS A MARKDOWN DOCUMENT:

# Exploratory Analysis: {targetNodeLabel}

## Key Insights
- [Insight 1 about the target node and its position in the knowledge graph]
- [Insight 2]
...

## Knowledge Gaps
- **Gap 1**: [Description of the gap]
  - *Research Opportunity*: [How this gap could be addressed]
  - *Potential Impact*: [Why filling this gap matters]

- **Gap 2**: [Description of the gap]
  - *Research Opportunity*: [How this gap could be addressed]
  - *Potential Impact*: [Why filling this gap matters]
...

## Potential Connections
- **Connection to [Domain/Field 1]**: [Description of how the target node relates to this domain]
- **Connection to [Domain/Field 2]**: [Description of how the target node relates to this domain]
...

## Suggested Research Directions
1. **[Research Direction 1]**
   - *Approach*: [Suggested methodology]
   - *Expected Outcomes*: [What might be discovered]
   - *Required Expertise*: [Fields or skills needed]

2. **[Research Direction 2]**
   - *Approach*: [Suggested methodology]
   - *Expected Outcomes*: [What might be discovered]
   - *Required Expertise*: [Fields or skills needed]
...

## Recommended Next Steps
1. [Specific action to take]
2. [Another specific action]
...

Provide scientifically grounded analysis with specific, actionable research directions. Focus on identifying non-obvious connections and opportunities that could lead to novel discoveries or applications.`;

      default:
        return `Please provide a response for the action: ${action}`;
    }
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