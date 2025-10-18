# Testing Language Change with Form Persistence

## Test Scenarios

### 1. Language Change Warning in Edit Mode

**Steps:**

1. Log in as a Student user
2. Go to Profile page
3. Click "Edit Profile" button
4. Make some changes (e.g., type in self-introduction field)
5. Try to change language from the dropdown

**Expected Result:**

- A warning dialog should appear with title "Save changes before switching language?"
- Dialog should have 3 options:
  - "Continue Editing" - closes dialog, stays in edit mode
  - "Discard & Switch" - loses changes and switches language
  - "Save & Switch" - saves changes then switches language

### 2. Save & Switch Functionality

**Steps:**

1. Follow steps 1-5 from Test 1
2. Click "Save & Switch" button

**Expected Result:**

- Console should show: "Saving data before language change"
- Data should be saved to localStorage
- Page should reload with new language
- Recovery dialog should appear asking to restore saved changes

### 3. Data Recovery After Language Change

**Steps:**

1. After language switch from Test 2
2. When recovery dialog appears, click "Restore"

**Expected Result:**

- Edit mode should be activated
- All previously entered data should be restored
- Success message "Data recovered successfully" should appear

### 4. Browser Refresh in Edit Mode

**Steps:**

1. Enter edit mode
2. Make changes
3. Refresh the browser (F5 or Cmd+R)

**Expected Result:**

- Browser warning "Changes you made may not be saved"
- After refresh, recovery dialog should appear
- Clicking "Restore" should recover all data

### 5. Cancel Button Warning

**Steps:**

1. Enter edit mode
2. Make changes
3. Click "Cancel" button

**Expected Result:**

- Warning dialog about unsaved changes
- Options to continue editing or discard changes

## Debug Console Logs

Enable browser console to see these debug messages:

- "Language change requested: [language]"
- "checkUnsavedChanges event received"
- "Auto-saving form data"
- "Saving data before language change"
- "Performing language change to: [language]"

## localStorage Keys

Check browser's Application > Local Storage for:

- `profileEditDraft_profile_edit_[userId]_Student` - Contains saved form data
- `language` - Current language setting

## Common Issues & Solutions

1. **Warning not showing:**

   - Check if user role is "Student"
   - Verify edit mode is active
   - Check console for event dispatch logs

2. **Data not persisting:**

   - Check localStorage quota
   - Verify formPersistenceKey is consistent
   - Check for console errors

3. **Recovery dialog not appearing:**
   - Ensure data was saved before reload
   - Check if persisted data differs from current data
   - Verify role and edit mode conditions
