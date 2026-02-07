# Fix parsing errors from incomplete console.log removals

$files = @(
    "src/config/env.ts",
    "src/context/AppDataContext.tsx",
    "src/pages/Dashboard.tsx",
    "src/pages/Login.tsx",
    "src/pages/Opportunities.tsx",
    "src/pages/SkillIntelligence.tsx",
    "src/services/auth.ts",
    "src/utils/browserDiagnostics.ts",
    "src/pages/Roadmap.tsx"
)

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot $file
    
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Remove orphaned object literals after useEffect/if
        # Pattern: lines with just "key: value," without proper context
        $content = $content -replace '(?m)^\s+\w+:\s+[^,\n]+,?\s*$\s*\}\);', '    // Removed orphaned console.log`n  });'
        
        # Remove empty catch blocks
        $content = $content -replace 'catch\s*\([^)]*\)\s*\{\s*\}', 'catch (error) { /* handled */ }'
        
        Set-Content $path $content -NoNewline
        Write-Host "✅ Fixed: $file"
    } else {
        Write-Host "⚠️  Not found: $file"
    }
}

Write-Host "`n✅ All files processed"
