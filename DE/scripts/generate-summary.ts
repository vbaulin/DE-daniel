#!/usr/bin/env tsx
/**
 * Standalone Summary Generator Script
 * 
 * This script demonstrates how to use the summary generation utilities
 * outside of the main application framework.
 */

import { generateSummary, formatSummaryAsMarkdown, createStandaloneSummary } from '../src/utils/summaryGenerator';
import { ConceptDesignState } from '../src/types';

/**
 * Create a sample concept for demonstration
 */
function createSampleConcept(): Partial<ConceptDesignState> {
  return {
    objective: "Bio-Inspired Adaptive Material System",
    components: {
      materials: ["Shape_Memory_Polymer", "Carbon_Nanotubes", "Hydrogel_Matrix"],
      mechanisms: ["Shape_Memory_Effect", "Electrical_Conductivity", "pH_Sensitivity"],
      methods: ["3D_Printing", "Electrospinning", "Chemical_Crosslinking"],
      theoretical_concepts: ["Smart_Materials_Theory", "Biomimetics"]
    },
    cssVectorDraft: {
      context: {
        material_primary: ["Shape_Memory_Polymer", "Carbon_Nanotubes"],
        environment_type: "Physiological_Conditions"
      },
      constraints: {
        objective_type: "Adaptive_Response"
      }
    }
  };
}

/**
 * Main demonstration function
 */
function main() {
  console.log('📊 Research Discovery Engine - Summary Generator\n');

  try {
    // Create sample concept
    const conceptData = createSampleConcept();
    
    console.log('🔄 Generating summary...\n');
    
    // Generate summary using standalone function
    const { summary, markdown } = createStandaloneSummary(conceptData, undefined, {
      summaryLength: 'standard',
      technicalLevel: 'technical',
      includeComponents: true,
      includeRelatedWork: false,
      includeRecommendations: true,
      outputFormat: 'markdown'
    });

    // Display results
    console.log('✅ Summary generated successfully!\n');
    console.log('📄 Summary Content:');
    console.log('═'.repeat(60));
    console.log(markdown);
    console.log('═'.repeat(60));
    console.log(`\n📊 Summary Metadata:`);
    console.log(`   Word Count: ${summary.metadata.wordCount}`);
    console.log(`   Reading Time: ${summary.metadata.readingTime}`);
    console.log(`   Complexity: ${summary.metadata.complexity}`);
    console.log(`   Completeness: ${summary.metadata.completeness}%`);
    console.log(`   Keywords: ${summary.metadata.keywords.join(', ')}`);

  } catch (error) {
    console.error('❌ Error generating summary:', error);
  }
}

// Run the demonstration
main(); 