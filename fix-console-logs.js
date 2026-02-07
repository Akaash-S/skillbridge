const fs = require('fs');
const path = require('path');

// Files with incomplete console.log removals
const filesToFix = [
  'src/config/env.ts',
  'src/context/AppDataContext.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/Opportunities.tsx',
  'src/pages/SkillIntelligence.tsx',
  'src/services/auth.ts',
  'src/utils/browserDiagnostics.ts',
  'src/pages/Roadmap.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern 1: Remove orphaned object literals after useEffect/if statements
    // Matches patterns like:
    //   useEffect(() => {
    //     key: value,
    //     key2: value2
    //   });
    content = content.replace(/(\s+)([\w\s]+:\s+[^,\n]+,?\s*)+\s*\}\);/g, (match, indent) => {
      // Check if this looks like an orphaned object literal
      if (match.includes(':') && !match.includes('function') && !match.includes('=>')) {
        return indent + '// Removed orphaned console.log\n' + indent + '});';
      }
      return match;
    });
    
    // Pattern 2: Remove empty catch blocks with just {}
    content = content.replace(/catch\s*\([^)]*\)\s*\{\s*\}/g, 'catch (error) {\n      // Error handled\n    }');
    
    // Pattern 3: Remove empty try/catch that just rethrows
    content = content.replace(/try\s*\{([^}]+)\}\s*catch\s*\([^)]*\)\s*\{\s*\}/g, '$1');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✅ All files processed');
