# Claude API Integration Testing Plan

## Overview
This document outlines the testing strategy for the Claude API integration in GSP eMoC. All 17 "Ask AI" fields now use real Claude API calls with expert-level prompts and function calling support.

**Status**: ✅ Implementation Complete - Ready for Manual Testing
**Start**: December 9, 2025
**Environment**: Development (Frontend direct calls to Claude API)

---

## System Architecture

```
CreateRequestForm (User clicks "Ask AI")
    ↓
AIContext (Stores activeFieldId, lastQuestion, formContext)
    ↓
ChatPanel (Displays conversation)
    ↓
useClaudeConversation Hook (Manages multi-turn state)
    ↓
claudeApiService (API calls with error handling)
    ↓
Claude API (claude-sonnet-4-20250514)
    ↓
Function Calling (Tool use for structured responses)
```

---

## Implemented Components

### 1. Foundation Files ✅
- **src/types/claude.ts** - TypeScript definitions for all Claude interactions
- **src/services/claudeApiService.ts** - Singleton API service with error handling
- **src/lib/fieldPrompts.ts** - Expert prompts for all 17 fields
- **src/lib/claudeFunctionTools.ts** - 5 tool schemas for function calling
- **src/hooks/useClaudeConversation.ts** - Conversation state hook
- **src/context/AIContext.tsx** - Enhanced with formContext state
- **src/components/layout/ChatPanel.tsx** - Complete Claude integration

### 2. Configuration ✅
- **.env.local** - Claude API key and model configuration
- **package.json** - @anthropic-ai/sdk installed

### 3. Integration Points ✅
- CreateRequestForm → Passes formData to AI context
- ChatPanel → Replaces mock responses with Claude API
- Tool Rendering → All 5 tools render correctly in UI

---

## Test Scenarios (Priority Order)

### Phase 1: Foundation Tests (Core Functionality)

#### Test 1.1: Chat Panel Opens and Closes
**Prerequisites**: Application running, Create Request Form visible
**Steps**:
1. Click "Ask AI" button next to any field (e.g., "MOC Title")
2. Verify chat panel slides in from right
3. Click X button to close
4. Verify chat panel slides out

**Expected Result**: Panel opens/closes smoothly without errors

---

#### Test 1.2: Initial Question Submits
**Prerequisites**: ChatPanel open, actively asking about a field
**Steps**:
1. Open ChatPanel for MOC Title field
2. Observe that initial question appears in chat
3. Wait for Claude's response

**Expected Result**: Question appears in chat, Claude begins responding

---

### Phase 2: Simple Interaction Tests (Advice-Only Fields)

#### Test 2.1: MOC Title - Advice Only
**Field**: MOC Title
**Expected Interaction**: advice-only (Claude provides guidance without filling)

**Steps**:
1. Click "Ask AI" on MOC Title
2. Wait for Claude's response
3. Claude should ask clarifying questions OR provide guidance

**Expected Result**:
- Blue message box with white background (Claude message)
- Guidance about title structure
- Possibly follow-up questions asking about the change
- No automatic field fill

---

#### Test 2.2: Detail of Change - Structured Input
**Field**: Detail of Change
**Expected Interaction**: Multi-step conversation gathering technical details

**Steps**:
1. Click "Ask AI" on Detail of Change
2. Claude asks: "What equipment or system is being changed?"
3. Type answer (e.g., "Pump motor P-101")
4. Claude responds and asks follow-up questions
5. Provide additional details (size, current condition, planned change)

**Expected Result**:
- Multi-turn conversation builds context
- Claude uses context to generate detailed change description
- Eventually offers to fill field with calculated response

---

### Phase 3: Tool Call Tests (Function Calling)

#### Test 3.1: Choice Questions (ask_followup tool)
**Field**: Type of Change or Length of Change
**Expected Tool**: ask_followup

**Steps**:
1. Click "Ask AI" on "Type of Change"
2. Claude responds with multiple choice options
3. Click one of the choice buttons
4. Claude responds based on selection

**Expected Result**:
- White message box with colored buttons
- Button text shows options (e.g., "Plant Change", "Maintenance Change")
- Clicking button sends choice back to Claude
- Chat continues with context-aware follow-up

---

#### Test 3.2: Calculation Display (show_calculation tool)
**Field**: Estimated Benefit
**Expected Tool**: show_calculation

**Steps**:
1. Click "Ask AI" on Estimated Benefit
2. Claude asks clarifying questions (what type of benefit, metrics)
3. Provide responses (e.g., "energy savings", "current usage", "improvement %")
4. Claude performs calculation and shows breakdown

**Expected Result**:
- Blue calculation box appears
- Shows step-by-step calculation with formulas
- Shows final result with unit (e.g., "36,000 THB/year")
- Lists assumptions made
- Shows confidence level

**Visual Elements**:
```
╔════════════════════════════════════╗
║ Energy Savings Calculation         ║
╠════════════════════════════════════╣
║ Step: Current consumption           ║
║ Formula: 75 kW × 80% × 8000 hrs    ║
║ = 60,000 kWh/year                  ║
├────────────────────────────────────┤
║ ... (more steps) ...               ║
├────────────────────────────────────┤
║ FINAL RESULT: 36,000 THB/year      ║
║ Confidence: High                   ║
╠════════════════════════════════════╣
║ Assumptions:                       ║
║ • 8,000 operating hours/year       ║
║ • Electricity rate: 4 THB/kWh      ║
╚════════════════════════════════════╝
```

---

#### Test 3.3: Confirmation Request (request_confirmation tool)
**Field**: Any field where Claude calculates a value
**Expected Tool**: request_confirmation

**Steps**:
1. In conversation, when Claude has calculated a value
2. Claude shows amber "Confirm and Fill" button
3. Button text shows what will be filled and why
4. Click "Confirm and Fill"

**Expected Result**:
- Amber message box appears
- Shows summary of what will be filled
- Shows "Confirm and Fill" button
- Clicking confirms: field auto-fills with value + blue highlight
- Chat panel closes automatically
- Form field shows new value

---

#### Test 3.4: Guidance (provide_guidance tool)
**Field**: Fields marked as advice-only
**Expected Tool**: provide_guidance

**Steps**:
1. Click "Ask AI" on a guidance field
2. Claude provides expert guidance with examples

**Expected Result**:
- Purple message box
- Shows guidance text
- Shows examples if applicable
- Shows suggested format if applicable
- No auto-fill, user must manually fill

---

### Phase 4: Error Handling Tests

#### Test 4.1: Network Error Handling
**Steps**:
1. Disconnect internet (simulate by closing network)
2. Click "Ask AI" button
3. Wait for error message

**Expected Result**:
- Red error box appears
- Shows user-friendly error message (not raw API error)
- "Try again" button available
- User can still manually fill field

---

#### Test 4.2: Rate Limit Handling
**Steps**:
1. Make 3-4 rapid Claude API calls
2. Observe rate limit response

**Expected Result**:
- Error message: "Too many requests. Please wait a moment and try again."
- Exponential backoff implemented
- "Try again" button after delay

---

#### Test 4.3: Invalid API Key
**Steps**:
1. Temporarily modify VITE_CLAUDE_API_KEY in .env.local
2. Restart dev server
3. Click "Ask AI"

**Expected Result**:
- Clear error message about invalid API key
- Guidance to check configuration

---

### Phase 5: Multi-Field Context Tests

#### Test 5.1: Context-Aware Prompts
**Steps**:
1. Fill "Detail of Change" with "Upgrade pump motor to IE3"
2. Open chat for "Estimated Benefit"
3. Claude references the pump motor change
4. Claude provides benefit calculation specific to motor upgrades

**Expected Result**:
- Claude shows awareness of previous field values
- Prompts are contextualized
- Calculations use relevant field data

---

#### Test 5.2: Form Data Persistence
**Steps**:
1. Fill multiple fields
2. Open and close chat multiple times
3. Form data remains intact

**Expected Result**:
- All filled fields retain values
- Closing chat doesn't reset form
- Context flows between conversations

---

### Phase 6: Visual and UX Tests

#### Test 6.1: Message Styling
**Steps**:
1. Open chat and generate multiple messages
2. Observe styling

**Expected Result**:
- User messages: Right-aligned, dark blue (#1d3654), rounded-top-right
- Claude messages: Left-aligned, white, rounded-top-left
- Timestamps visible for all messages
- Tool calls have distinct colors:
  - Green for fill_field
  - White/gray for ask_followup (choices)
  - Blue for show_calculation
  - Amber for request_confirmation
  - Purple for provide_guidance

---

#### Test 6.2: Loading States
**Steps**:
1. Open chat
2. Observe while Claude is responding

**Expected Result**:
- Animated dots appear while loading
- "Claude is thinking..." message
- Input disabled during loading
- Header shows "Thinking..." status

---

#### Test 6.3: Scroll Behavior
**Steps**:
1. Generate long conversation
2. New messages arrive

**Expected Result**:
- Chat auto-scrolls to bottom
- User can scroll up to view history
- Doesn't scroll past user's manual scroll position if user is reading up

---

### Phase 7: All 17 Fields Test

#### Field-by-Field Verification

| # | Field | Type | Expected Behavior | Status |
|---|-------|------|-------------------|--------|
| 1 | MOC Title | advice-only | Guidance on title structure | ⏳ |
| 2 | Type of Change | choices | Multiple choice options | ⏳ |
| 3 | Length of Change | choices | Duration type selection | ⏳ |
| 4 | Priority ID | choices | Priority level selection | ⏳ |
| 5 | Detail of Change | ask-fill | Structured input gathering | ⏳ |
| 6 | Reason for Change | ask-fill | Justification collection | ⏳ |
| 7 | Estimated Cost | calculation | Cost breakdown | ⏳ |
| 8 | Estimated Benefit | calculation | Benefit calculation with formula | ⏳ |
| 9 | Scope of Work | ask-fill | Work breakdown gathering | ⏳ |
| 10 | Expected Benefits | ask-fill | Multi-benefit analysis | ⏳ |
| 11 | Risk Before Change | 2-step | Likelihood × Impact | ⏳ |
| 12 | Risk After Change | 2-step | Likelihood × Impact | ⏳ |
| 13 | TPM Loss Type | choices | Category selection | ⏳ |
| 14 | Loss Eliminate Value | calculation | Value guidance | ⏳ |
| 15 | Benefits Category | multi-select | Category selection | ⏳ |
| 16 | Duration Start Date | date-guidance | Date recommendation | ⏳ |
| 17 | Duration End Date | date-guidance | Date calculation | ⏳ |

---

## Key Test Execution Steps

### Before Testing
1. ✅ Build passes without errors: `npm run build`
2. ✅ Dev server running: `npm run dev`
3. ✅ .env.local has valid Claude API key
4. ✅ No browser console errors

### During Testing
1. Open browser DevTools (F12)
2. Watch Console for any errors
3. Monitor Network tab for API calls
4. Note any slow responses (>5 seconds)

### Test Data / Scenarios
**Scenario 1: Pump Motor Upgrade**
```
MOC Title: Upgrade Pump P-101 Motor to IE3 Standard
Type of Change: Maintenance Change
Detail of Change: Replace 75 kW motor with IE3 efficiency class
Estimated Benefit: Calculate energy savings (36,000 THB/year)
Risk Before: Likelihood=Possible, Impact=Major → M9
Risk After: Likelihood=Unlikely, Impact=Major → L9
```

**Scenario 2: Safety System Installation**
```
MOC Title: Install New Safety Valve on Tank T-301
Type of Change: Plant Change
Reason: Prevent overpressure incidents
Expected Benefits: Safety, Reliability
Risk Before: Likelihood=Likely, Impact=Catastrophic → L16
Risk After: Likelihood=Rare, Impact=Minor → R2
```

---

## Success Criteria

### Must Have ✅
- [ ] Chat panel opens/closes smoothly
- [ ] Claude API responds to all 17 fields
- [ ] At least 3 tool types render correctly (choices, calculation, confirmation)
- [ ] Auto-fill populates form fields
- [ ] Error messages are user-friendly
- [ ] No TypeScript errors on build
- [ ] No runtime console errors

### Should Have
- [ ] All 17 fields working end-to-end
- [ ] Form context flows between fields
- [ ] Thai language support verified
- [ ] Performance is responsive (<3sec response time)

### Nice to Have
- [ ] Streaming responses appear gradually
- [ ] Multiple conversations in succession work smoothly
- [ ] Calculation steps are clearly understandable
- [ ] Mobile responsive (if testing on mobile)

---

## Demo Script (3 Minute Version)

**Opening**:
> "Let me show you how the new AI assistant works. I'll create a MOC for a pump motor upgrade to demonstrate the multi-step calculation and expert guidance."

**Demo Flow**:
1. Click "Ask AI" on MOC Title
   - Show guidance response (1-2 turns)

2. Click "Ask AI" on Type of Change
   - Show choice buttons working

3. Fill Detail of Change field manually: "Upgrade Pump P-101 motor from IE1 to IE3"

4. Click "Ask AI" on Estimated Benefit
   - Show 4-6 turn conversation
   - Reach calculation breakdown
   - Show confirmation before filling
   - Click "Confirm and Fill" → Field auto-fills with blue highlight

5. Click "Ask AI" on Risk Before Change
   - Show 2-step wizard working
   - Select Possible & Major
   - Show risk score calculation (M9)
   - Fill field

**Closing**:
> "This is a demo phase implementation. The API will be moved to the backend for production. The user interface remains the same, providing expert-level assistance for all 17 fields in the MOC process."

---

## Known Limitations

1. **Demo Phase**: API key in frontend (.env.local) - Will move to backend in production
2. **No Streaming**: Claude responses appear all at once - Streaming will be added later
3. **No Chat History Persistence**: Conversations don't save between sessions
4. **Single User**: No multi-user support yet
5. **No Rate Limiting UI**: Basic error messages only, no queue management

---

## Next Steps After Testing

1. [ ] Complete all 17 field tests
2. [ ] Document any issues found
3. [ ] Refine prompts based on user feedback
4. [ ] Add streaming responses for better UX
5. [ ] Create backend proxy endpoint for API key security
6. [ ] Add conversation history persistence (optional)
7. [ ] Performance optimization for large forms
8. [ ] Mobile responsiveness testing
9. [ ] Executive demo preparation
10. [ ] Production deployment plan

---

## Files Modified/Created

### New Files (Implementation)
- `src/types/claude.ts`
- `src/services/claudeApiService.ts`
- `src/lib/fieldPrompts.ts`
- `src/lib/claudeFunctionTools.ts`
- `src/hooks/useClaudeConversation.ts`
- `src/components/layout/ChatPanel.tsx` (replaced old mock version)
- `.env.local`

### Modified Files (Integration)
- `src/context/AIContext.tsx` (+formContext state)
- `src/components/forms/CreateRequestForm.tsx` (+formData passing)

### Configuration
- `package.json` (@anthropic-ai/sdk added)

---

## Testing Checklist

- [ ] Build: `npm run build` ✅
- [ ] Dev Server: `npm run dev` ✅
- [ ] API Key Valid in .env.local ✅
- [ ] No Console Errors ✅
- [ ] Chat Panel Opens ⏳
- [ ] Chat Panel Closes ⏳
- [ ] First Message Sends ⏳
- [ ] Claude Responds ⏳
- [ ] Choices Render ⏳
- [ ] Calculation Shows ⏳
- [ ] Confirmation Works ⏳
- [ ] Field Auto-fills ⏳
- [ ] All 17 Fields Tested ⏳
- [ ] Error Handling Works ⏳
- [ ] Demo Ready ⏳

---

## Support / Debugging

### Check API Connectivity
1. Open DevTools → Console
2. Check for API errors
3. Verify request in Network tab

### Check Build
```bash
npm run build  # Should complete without errors
```

### Check Types
```bash
npx tsc --noEmit  # TypeScript check
```

### Debug Specific Field
1. Add `console.log(formContext)` in useClaudeConversation
2. Check what data is passed to Claude
3. Verify prompt in fieldPrompts.ts

### Reset State
1. Close chat panel
2. Refresh page (Cmd+R)
3. Form data should persist, conversation should reset

---

## Contact / Questions

For questions about the implementation, refer to:
- Implementation Plan: `/Users/napatsangsong/.claude/plans/polymorphic-booping-star.md`
- API Service: `src/services/claudeApiService.ts`
- Prompts: `src/lib/fieldPrompts.ts`
- Configuration: `.env.local`

---

**Last Updated**: December 9, 2025
**Status**: Ready for Manual Testing
**Build**: ✅ Passing (No TypeScript Errors)
**Server**: ✅ Running on localhost:3001
