# Standalone Utility Usage Guide

This guide shows how to use the Research Discovery Engine's protocol and summary generators as standalone scripts, independent of the main web application.

## Prerequisites

```bash
cd DE
npm install  # Installs tsx and @types/node dependencies
```

## Protocol Generator

### Basic Usage

```bash
# Generate a basic protocol with console output
npx tsx scripts/generate-protocol.ts \
  --objective "Smart hydrogel actuator" \
  --materials "PEG_Hydrogel,Iron_Nanoparticles" \
  --mechanisms "Magnetic_Actuation,Swelling"
```

### Advanced Usage

```bash
# Generate detailed protocol with file output
npx tsx scripts/generate-protocol.ts \
  --objective "Adaptive memristor network" \
  --materials "Silver_Nanowires,PEDOT_PSS" \
  --mechanisms "Synaptic_Plasticity,Conductance_Switching" \
  --methods "Electrodeposition,Annealing" \
  --detail-level advanced \
  --output-file ./protocols/memristor-protocol.md
```

### Interactive Mode

```bash
# Run without arguments for interactive prompts
npx tsx scripts/generate-protocol.ts
```

### Sample Output

```bash
# Using demo data
npx tsx scripts/generate-protocol.ts
```

## Summary Generator

### Basic Usage

```bash
# Generate a demo summary
npx tsx scripts/generate-summary.ts
```

## Command Line Options

### Protocol Generator Options

| Option | Description | Example |
|--------|-------------|---------|
| `--objective` | Concept objective (required) | `"Smart hydrogel actuator"` |
| `--materials` | Comma-separated materials | `"PEG,Iron_Nanoparticles"` |
| `--mechanisms` | Comma-separated mechanisms | `"Magnetic_Actuation,Swelling"` |
| `--methods` | Comma-separated methods | `"Sol_Gel,Crosslinking"` |
| `--detail-level` | Detail level | `basic`, `intermediate`, `advanced` |
| `--output-file` | Output file path | `./protocols/my-protocol.md` |
| `--help`, `-h` | Show help | |

## Output Examples

### Protocol Output Structure

```markdown
# Experimental Protocol: [Objective]

**Objective:** [Concept objective]
**Concept ID:** [Generated ID]
**Generated:** [Timestamp]
**Estimated Duration:** [Time estimate]
**Skill Level:** [Beginner/Intermediate/Advanced]

## Protocol Overview
[Overview section with time estimate]

## Materials and Equipment
[Required materials and equipment lists]

## Fabrication and Synthesis
[Step-by-step fabrication procedures]

## Characterization Protocol
[Measurement and characterization procedures]

## Experimental Testing
[Testing procedures and setup]

## Data Analysis
[Analysis procedures and expected outcomes]
```

### Summary Output Structure

```markdown
# Concept Summary: [Title]

**Generated:** [Timestamp]
**Reading Time:** [Estimated time]
**Complexity:** [Low/Medium/High]
**Completeness:** [Percentage]

## Abstract
[Concept overview and key points]

## Concept Overview
[Detailed concept description]

## Component Analysis
[Materials, mechanisms, methods breakdown]

## Technical Specifications
[System architecture and specifications]

## Recommendations
[Next steps and research directions]
```

## Integration with External Tools

### Using in Build Scripts

```bash
#!/bin/bash
# generate-all-protocols.sh

concepts=(
  "Smart hydrogel actuator:PEG_Hydrogel,Iron_Nanoparticles:Magnetic_Actuation,Swelling"
  "Adaptive memristor network:Silver_Nanowires,PEDOT_PSS:Synaptic_Plasticity"
)

for concept in "${concepts[@]}"; do
  IFS=':' read -r objective materials mechanisms <<< "$concept"
  npx tsx scripts/generate-protocol.ts \
    --objective "$objective" \
    --materials "$materials" \
    --mechanisms "$mechanisms" \
    --output-file "./protocols/${objective// /-}-protocol.md"
done
```

### Using in Node.js Applications

```javascript
import { createStandaloneProtocol } from './src/utils/protocolGenerator.js';

const conceptData = {
  objective: "Smart responsive material",
  components: {
    materials: ["Shape_Memory_Alloy", "Polymer_Matrix"],
    mechanisms: ["Shape_Memory_Effect", "Thermal_Response"],
    methods: ["Hot_Pressing", "Heat_Treatment"],
    theoretical_concepts: []
  }
};

const { protocol, markdown } = createStandaloneProtocol(conceptData, {
  detailLevel: 'advanced',
  includeTimeEstimates: true,
  outputFormat: 'markdown'
});

console.log(markdown);
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Make sure tsx is installed
   ```bash
   npm install -g tsx
   ```

2. **Module not found**: Ensure you're in the DE directory
   ```bash
   cd DE
   npx tsx scripts/generate-protocol.ts --help
   ```

3. **TypeScript errors**: Check that @types/node is installed
   ```bash
   npm install --save-dev @types/node
   ```

### Getting Help

```bash
# Show detailed help for protocol generator
npx tsx scripts/generate-protocol.ts --help

# Show version and basic info
npx tsx scripts/generate-protocol.ts --version
```

## Best Practices

1. **Use descriptive objectives**: Clear, specific objectives generate better protocols
2. **Include relevant materials**: More specific materials lead to more detailed procedures
3. **Specify mechanisms**: Include key mechanisms for comprehensive protocols
4. **Choose appropriate detail level**: Match detail level to your expertise and needs
5. **Save to files**: Use `--output-file` for documentation and sharing 