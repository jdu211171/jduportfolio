# Student Profile Versioning Implementation Summary

## Overview

This implementation introduces a three-state versioning system for student profiles with minimal changes to existing code. The three states are:

1. **Live** - Public profile visible to everyone (stored in `Students` table)
2. **Draft** - Student's editable working copy (stored in `Drafts` table with `version_type='draft'`)
3. **Pending** - Submitted version under review (stored in `Drafts` table with `version_type='pending'`)

## Database Changes

### Migration: `20251108193012-add-version-type-to-drafts.js`

**Changes:**

- Added `version_type` ENUM column ('draft', 'pending') to `Drafts` table
- Removed unique constraint on `student_id` alone
- Added unique constraint on `(student_id, version_type)` to ensure exactly one draft and one pending per student
- All existing drafts default to `version_type='draft'`

**Reversibility:**

- Migration includes full `down` method to revert changes
- Can safely rollback to previous schema if needed

### Model Updates

**Draft Model (`portfolio-server/src/models/Draft.js`):**

- Added `version_type` field with ENUM('draft', 'pending')
- Added unique index on `['student_id', 'version_type']`

**Student Model (`portfolio-server/src/models/Student.js`):**

- Added `drafts` association (hasMany) for all draft versions
- Updated `draft` association with scope `{ version_type: 'draft' }`
- Added `pendingDraft` association with scope `{ version_type: 'pending' }`

## Backend Service Changes

### DraftService (`portfolio-server/src/services/draftService.js`)

**`upsertDraft(studentId, newProfileData)`:**

- Always queries for and updates the `version_type='draft'` version
- Creates new draft with `version_type='draft'` if none exists
- Student edits always target their draft version

**`submitForReview(draftId)`:**

- Validates that the draft being submitted has `version_type='draft'`
- Checks for existing pending submission to prevent duplicates
- Creates or updates pending version by cloning draft data
- Sets pending status to 'submitted'
- Leaves draft version unchanged for continued editing

**`updateStatusByStaff(draftId, status, comments, reviewedBy)`:**

- Only operates on `version_type='pending'` drafts
- On approval:
  - Updates Live profile in Students table
  - Refreshes draft version with new live data
  - Clears changed_fields
- On rejection/resubmission:
  - Keeps draft version unchanged
  - Stores comments in pending version

**`getStudentWithDraft(studentId)`:**

- Returns both draft and pendingDraft versions separately
- Frontend receives `{ ...studentData, draft, pendingDraft }`

**`getAll(filter)` - Staff Review Interface:**

- Queries only `version_type='pending'` drafts
- Shows submitted profiles for review

### StudentService (`portfolio-server/src/services/studentService.js`)

**`getStudentByStudentId(...)`:**

- Includes both `draft` and `pendingDraft` associations
- For Staff/Admin: uses pending draft when available
- For Students: uses their own draft version
- Returns both versions in response for proper frontend handling

### DraftController (`portfolio-server/src/controllers/draftController.js`)

**`submitDraft(req, res)`:**

- Validates `version_type='draft'` before submission
- Returns created/updated pending draft

**`getDraftByStudentId(req, res)`:**

- Returns structure with both draft and pendingDraft
- Creates default draft if none exists

## Frontend Changes

### Profile Component (`portfolio-client/src/pages/Profile/Top/Top.jsx`)

**New State Variables:**

```javascript
const [liveData, setLiveData] = useState(null) // Live profile from Students table
const [viewingLive, setViewingLive] = useState(false) // Toggle state
const [currentPending, setCurrentPending] = useState(null) // Pending draft
```

**Data Fetching:**

`fetchDraftData()` - For Students:

- Fetches from `/api/draft/student/:id`
- Stores live data separately
- Sets currentDraft and currentPending from response
- Defaults to draft view

`fetchStudentData()` - For Staff:

- Fetches from `/api/students/:id`
- Prioritizes pending draft for review
- Stores both draft and pending versions

**UI Components:**

Live/Draft Toggle (Students only, view mode):

```jsx
<Button onClick={() => setViewingLive(true)}>
  Live Profile
</Button>
<Button onClick={() => setViewingLive(false)}>
  Draft Profile
</Button>
```

**View Switching Effect:**

```javascript
useEffect(() => {
  if (viewingLive) {
    setStudent(liveData) // Show live data
  } else {
    setStudent({ ...liveData, draft: currentDraft.profile_data }) // Show draft
  }
}, [viewingLive, ...])
```

**Staff Comment Display:**

- Updated to show comments from `currentPending` instead of `currentDraft`
- Only shows when pending has comments and requires changes

### Translations (`portfolio-client/src/locales/translations.js`)

Added keys in all languages (EN, JA, UZ, RU):

- `liveProfile` - "Live Profile" / "公開版" / "Jonli profil" / "Живой профиль"
- `draftProfile` - "Draft Profile" / "編集版" / "Qoralama profil" / "Черновик профиля"

## Workflow Examples

### Student Workflow

1. **Initial State:**

   - Live: Empty/default profile in Students table
   - Draft: Auto-created when student first edits
   - Pending: Does not exist

2. **Student Edits:**

   - Opens profile → sees Draft view by default
   - Toggle to see Live (read-only)
   - All edits save to Draft (API: `PUT /api/draft` → upsertDraft)
   - Draft can be edited freely before submission

3. **Student Submits:**

   - Clicks "Submit" → Draft cloned to Pending
   - Draft status remains 'draft'
   - Pending created with status 'submitted'
   - Student can continue editing Draft while Pending is under review

4. **After Review:**
   - **If Approved:**
     - Pending → Live (Students table updated)
     - Draft refreshed with new Live data
     - Student sees updated Live profile
   - **If Changes Requested:**
     - Pending status updated, comments added
     - Draft unchanged - student continues editing
     - Student sees staff comments and incorporates feedback manually

### Staff Workflow

1. **View Submitted Profiles:**

   - Navigate to review interface
   - See list of Pending drafts (status='submitted')

2. **Review a Profile:**

   - Open student profile
   - See Pending version merged into view
   - Can add comments and mark status

3. **Approve:**

   - Set status to 'approved'
   - Backend promotes Pending → Live
   - Backend refreshes student's Draft with Live data

4. **Request Changes:**
   - Set status to 'resubmission_required'
   - Add comments
   - Student's Draft remains unchanged
   - Student incorporates feedback on their own schedule

## Migration Path

### For Existing Data

When migration runs:

1. All existing drafts get `version_type='draft'`
2. Unique constraint allows one draft per student
3. No pending versions exist initially
4. Students can immediately submit to create pending versions

### Testing Recommendations

1. **Database Migration Test:**

   ```bash
   npm run migrate
   # Verify no errors
   # Check that all existing drafts have version_type='draft'
   ```

2. **Draft/Pending Separation:**

   - Create draft as student
   - Submit draft
   - Verify two rows exist: one draft, one pending
   - Edit draft while pending under review

3. **Approval Flow:**

   - Submit as student
   - Approve as staff
   - Verify Live updated
   - Verify Draft refreshed

4. **Rejection Flow:**

   - Submit as student
   - Request changes as staff with comments
   - Verify student sees comments
   - Verify Draft unchanged

5. **UI Toggle:**
   - Login as student with approved profile
   - Toggle between Live and Draft views
   - Verify correct data shown

## Rollback Plan

If issues arise:

1. **Code Rollback:**

   ```bash
   git revert <commit-hash>
   ```

2. **Database Rollback:**

   ```bash
   npm run migratedown
   # Run specific migration down if needed
   ```

3. **Data Preservation:**
   - Migration down preserves data
   - Falls back to single draft per student
   - No data loss expected

## Benefits of This Approach

1. **Minimal Schema Changes:** Single column addition to existing table
2. **Non-Destructive:** Student work preserved during review
3. **Clear Separation:** Each version has distinct purpose and visibility
4. **Backward Compatible:** Existing code continues to work with draft association
5. **Scalable:** Can add more version types if needed in future
6. **Simple UI:** Toggle control is intuitive and minimal

## Known Limitations

1. **No Version History:** Only current versions stored (Live, Draft, Pending)
2. **Single Pending:** Only one submission can be under review at a time
3. **Manual Sync:** Students must manually incorporate staff feedback
4. **No Diff View:** No built-in comparison between versions (future enhancement)

## Future Enhancements

Potential improvements to consider:

1. **Version History:** Store historical snapshots for audit trail
2. **Diff Viewer:** Visual comparison between Live/Draft/Pending
3. **Auto-Sync:** Option to auto-apply suggested changes to Draft
4. **Bulk Operations:** Staff tools for batch approvals
5. **Notifications:** Real-time alerts for submission/approval
6. **Analytics:** Track submission/approval rates and times
