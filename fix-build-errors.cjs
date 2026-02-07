const fs = require('fs');
const path = require('path');

// Files with parsing errors and their approximate line numbers
const fixes = [
  {
    file: 'src/config/env.ts',
    search: /\/\/ Development helper\s+if \(env\.debugMode[^}]+\}\s+\}\);?\s+\}/s,
    replace: ''
  },
  {
    file: 'src/context/AppDataContext.tsx',
    search: /useEffect\(\(\) => \{\s+\w+:\s+[^}]+\}\);/s,
    replace: 'useEffect(() => {'
  },
  {
    file: 'src/pages/Dashboard.tsx',
    search: /case '[^']+':[\s\S]{0,100}\w+:\s+[^,\n]+,?\s+/,
    replace: (match) => match.replace(/\w+:\s+[^,\n]+,?\s+$/, '')
  },
  {
    file: 'src/pages/Login.tsx',
    search: /setTimeout\([^}]+\}\);[\s\S]{0,50}\w+:\s+[^,\n]+,?\s+/,
    replace: (match) => match.replace(/\w+:\s+[^,\n]+,?\s+$/, '')
  },
  {
    file: 'src/pages/Opportunities.tsx',
    search: /const setCachedJobs[^}]+\}\);[\s\S]{0,100}\w+:\s+[^,\n]+,?\s+/,
    replace: (match) => match.replace(/\w+:\s+[^,\n]+,?\s+$/, '')
  }
];

fixes.forEach(({ file, search, replace }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    if (typeof replace === 'function') {
      content = content.replace(search, replace);
    } else {
      content = content.replace(search, replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`ℹ️  No changes needed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n✅ Processing complete');
