/**
 * Prompt Utilities
 * 
 * This module provides utilities for loading and managing LLM prompts
 */

/**
 * Load a prompt from the prompts directory
 * 
 * @param promptName - Name of the prompt file (without extension)
 * @returns Promise resolving to the prompt text
 */
export const loadPrompt = async (promptName: string): Promise<string> => {
  try {
    const response = await fetch(`/prompts/${promptName}.txt`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading prompt ${promptName}:`, error);
    return '';
  }
};

/**
 * Save a prompt to localStorage (for development/testing)
 * 
 * @param promptName - Name of the prompt
 * @param promptText - Text of the prompt
 */
export const savePromptToLocalStorage = (promptName: string, promptText: string): void => {
  try {
    localStorage.setItem(`prompt_${promptName}`, promptText);
  } catch (error) {
    console.error(`Error saving prompt ${promptName} to localStorage:`, error);
  }
};

/**
 * Load a prompt from localStorage (for development/testing)
 * 
 * @param promptName - Name of the prompt
 * @returns The prompt text or null if not found
 */
export const loadPromptFromLocalStorage = (promptName: string): string | null => {
  try {
    return localStorage.getItem(`prompt_${promptName}`);
  } catch (error) {
    console.error(`Error loading prompt ${promptName} from localStorage:`, error);
    return null;
  }
};

/**
 * Format a prompt with variables
 * 
 * @param promptTemplate - Template string with {variable} placeholders
 * @param variables - Object with variable values
 * @returns Formatted prompt
 */
export const formatPrompt = (promptTemplate: string, variables: Record<string, any>): string => {
  let formattedPrompt = promptTemplate;
  
  // Replace each variable in the template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    formattedPrompt = formattedPrompt.replace(regex, String(value));
  });
  
  return formattedPrompt;
};