# Frontend Accessibility Fix Guide

## 🚨 Issue
Labels with `htmlFor` attributes don't match any element `id`, causing:
- Browser autofill issues
- Accessibility tool problems
- Screen reader navigation issues

## 🔍 Root Cause
The main issue is with `Select` components from shadcn/ui that don't automatically receive `id` attributes, but their labels use `htmlFor` to reference them.

## 🛠 Files That Need Fixing

### 1. Profile.tsx
**Issues:**
- `<Label htmlFor="experience">` → Select has no id="experience"
- `<Label htmlFor="education">` → Select has no id="education"  
- `<Label htmlFor="weeklyGoal">` → Select has no id="weeklyGoal"

### 2. Settings.tsx
**Issues:**
- Country checkboxes using dynamic IDs that may not match
- Various Select components without proper IDs

### 3. Help.tsx
**Issues:**
- `<Label htmlFor="contact-type">` → Select has no id="contact-type"

## 🔧 Fix Strategy

### Option 1: Add IDs to Select Components
Add `id` prop to SelectTrigger components:

```tsx
// Before (broken)
<Label htmlFor="experience">Experience</Label>
<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
</Select>

// After (fixed)
<Label htmlFor="experience">Experience</Label>
<Select value={value} onValueChange={onChange}>
  <SelectTrigger id="experience">
    <SelectValue />
  </SelectTrigger>
</Select>
```

### Option 2: Remove htmlFor from Labels
Remove `htmlFor` when not needed:

```tsx
// Before (broken)
<Label htmlFor="experience">Experience</Label>
<Select>...</Select>

// After (fixed)
<Label>Experience</Label>
<Select>...</Select>
```

### Option 3: Use Form Components
Use proper form field components that handle IDs automatically.

## 📋 Specific Fixes Needed

### Profile.tsx Fixes:
1. Line ~808: Add `id="experience"` to SelectTrigger
2. Line ~828: Add `id="education"` to SelectTrigger  
3. Line ~852: Add `id="weeklyGoal"` to SelectTrigger

### Help.tsx Fixes:
1. Line ~574: Add `id="contact-type"` to SelectTrigger

### Settings.tsx Fixes:
1. Multiple Select components need proper IDs
2. Country checkbox IDs need verification

## 🚀 Implementation Priority

**High Priority (Critical for Accessibility):**
- Profile.tsx Select components
- Help.tsx contact form Select
- Settings.tsx form elements

**Medium Priority:**
- Dynamic checkbox IDs
- Optional form enhancements

**Low Priority:**
- Cosmetic label improvements
- Non-interactive elements