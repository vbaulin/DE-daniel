#!/usr/bin/env tsx
/**
 * Environment Variable Loader Utility
 * 
 * This utility ensures consistent loading of environment variables
 * from the .env file located in the DE directory (parent of scripts)
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment variables from the .env file in the DE directory
 */
export function loadEnvironment(): { success: boolean; message: string; apiKeyPreview?: string } {
  // Try to find .env file in parent directory (DE folder)
  const envPath = resolve(__dirname, '..', '.env');
  const envExamplePath = resolve(__dirname, '..', '.env.example');
  
  if (existsSync(envPath)) {
    // Load from .env file
    const result = config({ path: envPath });
    
    if (result.error) {
      return {
        success: false,
        message: `Failed to load .env file: ${result.error.message}`
      };
    }
    
    // Verify OpenAI API key is loaded and clean it
    let apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        message: 'OPENAI_API_KEY not found in .env file'
      };
    }
    
    // Clean the API key by removing any whitespace/newlines
    apiKey = apiKey.replace(/\s+/g, '');
    process.env.OPENAI_API_KEY = apiKey;
    
    return {
      success: true,
      message: 'Environment variables loaded successfully from .env',
      apiKeyPreview: apiKey.substring(0, 20) + '...'
    };
    
  } else if (existsSync(envExamplePath)) {
    // Load from .env.example as fallback
    const result = config({ path: envExamplePath });
    
    return {
      success: false,
      message: 'Using .env.example - please create .env with your actual API key'
    };
    
  } else {
    return {
      success: false,
      message: 'No .env file found in DE directory. Please create one with your OpenAI API key.'
    };
  }
}

/**
 * Load environment and exit if unsuccessful (for scripts that require API access)
 */
export function requireEnvironment(): void {
  const result = loadEnvironment();
  
  if (!result.success) {
    console.error('❌ Environment loading failed:', result.message);
    console.error('📝 Please create a .env file in the DE directory with your OpenAI API key');
    process.exit(1);
  }
  
  console.log('✅', result.message);
  if (result.apiKeyPreview) {
    console.log('🔑 API Key:', result.apiKeyPreview);
  }
}

// If run directly, test the environment loading
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔧 Testing Environment Variable Loading...\n');
  
  const result = loadEnvironment();
  
  if (result.success) {
    console.log('✅', result.message);
    console.log('🔑 API Key Preview:', result.apiKeyPreview);
    console.log('🤖 Model:', process.env.OPENAI_MODEL || 'gpt-4o-mini');
    console.log('🎛️  Max Tokens:', process.env.OPENAI_MAX_TOKENS || '2000');
    console.log('🌡️  Temperature:', process.env.OPENAI_TEMPERATURE || '0.7');
  } else {
    console.error('❌', result.message);
    process.exit(1);
  }
} 