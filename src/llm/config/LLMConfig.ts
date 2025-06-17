/**
 * LLM Configuration Management
 * 
 * Handles configuration loading and validation for LLM services
 */

import { LLMConfig, ModelType } from '../types';

export class LLMConfigManager {
  private static instance: LLMConfigManager;
  private config: LLMConfig | null = null;

  private constructor() {}

  static getInstance(): LLMConfigManager {
    if (!LLMConfigManager.instance) {
      LLMConfigManager.instance = new LLMConfigManager();
    }
    return LLMConfigManager.instance;
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment(): LLMConfig {
    // Prioritize environment variables first, then try .env file
    let apiKey = process.env.OPENAI_API_KEY;
    
    // If not found in environment, try loading from .env file
    if (!apiKey && typeof require !== 'undefined') {
      try {
        require('dotenv').config();
        apiKey = process.env.OPENAI_API_KEY;
      } catch (e) {
        // dotenv not available, continue with system env vars
      }
    }
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.config = {
      apiKey,
      model: (process.env.OPENAI_MODEL as ModelType) || 'gpt-4o-mini',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      baseURL: process.env.OPENAI_BASE_URL,
      organization: process.env.OPENAI_ORGANIZATION,
      project: process.env.OPENAI_PROJECT
    };

    this.validateConfig(this.config);
    return this.config;
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    if (!this.config) {
      return this.loadFromEnvironment();
    }
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<LLMConfig>): void {
    if (!this.config) {
      this.loadFromEnvironment();
    }
    this.config = { ...this.config!, ...updates };
    this.validateConfig(this.config);
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: LLMConfig): void {
    if (!config.apiKey || config.apiKey.length < 10) {
      throw new Error('Invalid API key');
    }

    if (config.maxTokens < 1 || config.maxTokens > 100000) {
      throw new Error('Invalid max tokens: must be between 1 and 100000');
    }

    if (config.temperature < 0 || config.temperature > 2) {
      throw new Error('Invalid temperature: must be between 0 and 2');
    }
  }

  /**
   * Get model-specific configurations
   */
  getModelConfig(model: ModelType): Partial<LLMConfig> {
    const baseConfig = this.getConfig();
    
    const modelConfigs: Record<string, Partial<LLMConfig>> = {
      'gpt-4o': {
        maxTokens: 4000,
        temperature: 0.7
      },
      'gpt-4o-mini': {
        maxTokens: 2000,
        temperature: 0.7
      },
      'gpt-4-turbo': {
        maxTokens: 4000,
        temperature: 0.6
      },
      'gpt-4': {
        maxTokens: 2000,
        temperature: 0.6
      },
      'gpt-3.5-turbo': {
        maxTokens: 1500,
        temperature: 0.8
      }
    };

    return {
      ...baseConfig,
      model,
      ...modelConfigs[model]
    };
  }

  /**
   * Get research-optimized configuration
   */
  getResearchConfig(): LLMConfig {
    const baseConfig = this.getConfig();
    return {
      ...baseConfig,
      model: 'gpt-4o',
      temperature: 0.5, // More conservative for research
      maxTokens: 4000
    };
  }

  /**
   * Get protocol-optimized configuration
   */
  getProtocolConfig(): LLMConfig {
    const baseConfig = this.getConfig();
    return {
      ...baseConfig,
      model: 'gpt-4o',
      temperature: 0.3, // Very conservative for structured protocols
      maxTokens: 3000
    };
  }

  /**
   * Get summary-optimized configuration
   */
  getSummaryConfig(): LLMConfig {
    const baseConfig = this.getConfig();
    return {
      ...baseConfig,
      model: 'gpt-4o-mini',
      temperature: 0.7, // Balanced for readable summaries
      maxTokens: 2500
    };
  }
}

// Export singleton instance
export const llmConfig = LLMConfigManager.getInstance(); 