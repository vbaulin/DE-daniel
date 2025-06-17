#!/usr/bin/env tsx
/**
 * Simple OpenAI API Connection Test
 */

import { loadEnvironment } from './load-env';

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API Connection...\n');

  // Load environment variables
  const envResult = loadEnvironment();
  if (!envResult.success) {
    console.error('❌ Environment loading failed:', envResult.message);
    process.exit(1);
  }
  
  console.log('✅', envResult.message);
  if (envResult.apiKeyPreview) {
    console.log('🔑 API Key:', envResult.apiKeyPreview);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  
  console.log('🤖 Model:', model);
  console.log();

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  try {
    console.log('📡 Making test request...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, Research Discovery Engine!" in exactly those words.'
          }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ SUCCESS!');
    console.log('📝 Response:', data.choices[0].message.content);
    console.log('🔢 Tokens used:', data.usage.total_tokens);
    
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('💥 Error:', error.message);
    process.exit(1);
  }
}

testOpenAI(); 