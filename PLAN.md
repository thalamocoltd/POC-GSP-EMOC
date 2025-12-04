# Validation Errors UX Improvement Plan

## Current Behavior
- When user clicks "Submit Request" and validation fails:
  - Chat panel opens automatically
  - Validation errors displayed in chat
  - User must navigate chat to understand errors

## Desired Behavior
- Keep validation summary alert
- **Do NOT open chat panel**
- Show validation errors organized by section in dropdown menus
- Each error can be clicked to scroll and highlight the problematic field

## Implementation Strategy

### 1. Create Section-to-Fields Mapping
Define which fields belong to which section:
```
- General Information: mocTitle, lengthOfChange, typeOfChange, priorityId, areaId, unitId
- Change Details: detailOfChange, reasonForChange, scopeOfWork, benefitsValue, expectedBenefits, costEstimated, estimatedValue
- Risk Assessment: riskBeforeChange, riskAfterChange
- Attachments: (none)
```

### 2. Modify AIContext
- Add new method `reportValidationErrorsLocal()` that stores validation errors WITHOUT opening chat
- Keep existing `reportValidationErrors()` for field-level assists

### 3. Update Section Headers
For each `<section>` header, add:
- A dropdown button showing count of errors in that section
- Dropdown menu lists errors with:
  - Error icon (AlertCircle)
  - Field label
  - Error message (tooltip on hover)
  - Clickable to scroll + highlight field

### 4. Update CreateRequestForm
- Change `handleSubmit()` to:
  - Call validation as usual
  - Show validation summary alert
  - Store errors in state for section headers to use
  - **Do NOT call `reportValidationErrors()`** (which opens chat)
- Pass error state to section headers
- Fields with errors get red text styling

### 5. Error Display in Sections
Add a component/logic to section headers:
```
[Section Icon] Section Name [Error Badge: X errors]
```
Click badge to expand dropdown showing:
```
- ❌ Field Name | error message (tooltip)
- ❌ Another Field | error message
```

### 6. Styling Requirements
- Error count badge: Red background with white text
- Errors in dropdown: Each has icon (AlertCircle/X)
- Clicking error item:
  - Scrolls to field
  - Highlights field with red pulse animation (already exists)
  - Updates errors state as user fixes them (real-time)

## Files to Modify
1. **src/context/AIContext.tsx**
   - Add `reportValidationErrorsLocal()` method

2. **src/components/forms/CreateRequestForm.tsx**
   - Update `handleSubmit()` to not call chat-triggering validation
   - Add state for validation errors
   - Update section headers to show error dropdown
   - Pass error callback handlers
   - Create section-to-fields mapping

3. **Create src/components/forms/SectionErrorDropdown.tsx** (optional)
   - Reusable component for section error dropdown
   - Takes: section name, errors for this section, onClick callback
   - Renders: Badge + Dropdown menu

## Technical Details

### Dropdown Implementation
- Use Radix UI DropdownMenu or Popover
- Keep it simple and inline with section header
- Icon: AlertCircle or AlertTriangle (red)
- Smooth expand/collapse animation

### Error-to-Section Mapping
```typescript
const SECTION_FIELDS: Record<string, string[]> = {
  'section-general-info': ['mocTitle', 'lengthOfChange', 'typeOfChange', 'priorityId', 'areaId', 'unitId'],
  'section-change-details': ['detailOfChange', 'reasonForChange', 'scopeOfWork', 'benefitsValue', 'expectedBenefits', 'costEstimated', 'estimatedValue'],
  'section-risk': ['riskBeforeChange', 'riskAfterChange'],
}
```

### Click Handler Flow
1. User clicks error in dropdown
2. Call `handleScrollToField(fieldId)` (already exists)
3. Field scrolls into view with red pulse animation
4. Dropdown closes
5. User fixes field
6. Real-time validation updates (already works)
7. Error badge updates count in real-time

## Benefits
- ✅ Cleaner UX - no unexpected chat panel
- ✅ Error context preserved - see all errors at once
- ✅ Quick navigation - click to jump to error
- ✅ No chat pollution - keeps chat for field-level assistance
- ✅ Real-time feedback - errors disappear as fixed
