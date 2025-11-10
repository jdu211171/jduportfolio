# Auto-Checking Status Fix

## Issue

When Staff navigated to a student profile from `/checkprofile` page, the draft status was showing as 未確認 (Unconfirmed) instead of automatically changing to 確認中 (In Review/Checking).

## Root Cause

The auto-status update logic was only implemented in `fetchDraftData()` but not in `handleStateData()`.

**Flow:**

1. When navigating from `/checkprofile`, the ChekProfile component passes student data via navigation state
2. Top.jsx receives this data in `statedata` prop
3. When `statedata` exists, it calls `handleStateData()` instead of `fetchDraftData()`
4. `handleStateData()` didn't have the auto-checking logic, so the status remained 'submitted'

## Solution

Added the same auto-checking logic to `handleStateData()` that was already present in `fetchDraftData()`.

### Changes Made

**File:** `portfolio-client/src/pages/Profile/Top/Top.jsx`

#### 1. Made `handleStateData` async

```javascript
// Before
const handleStateData = () => {

// After
const handleStateData = async () => {
```

#### 2. Added auto-checking logic

```javascript
// Auto-update to 'checking' status when staff views submitted draft
if (role === 'Staff' && statedata.draft.status === 'submitted') {
	const staffId = JSON.parse(sessionStorage.getItem('loginUser'))?.id
	if (staffId) {
		try {
			await axios.put(`/api/draft/status/${statedata.draft.id}`, {
				status: 'checking',
				reviewed_by: staffId,
			})
			// Update local state
			statedata.draft.status = 'checking'
			statedata.draft.reviewed_by = staffId
			setDraft({ ...statedata.draft })
		} catch (error) {
			console.error('Failed to auto-update draft status:', error)
		}
	}
}
```

#### 3. Updated loadData to await handleStateData

```javascript
// Before
if (statedata) {
	handleStateData()
}

// After
if (statedata) {
	await handleStateData()
}
```

## How It Works

### Navigation Flow

1. **Staff clicks on student from `/checkprofile` table**
2. Navigates to `/checkprofile/profile/:studentId/top` with student data in state
3. Top.jsx loads with `statedata` prop
4. `handleStateData()` is called
5. **NEW:** If draft status is 'submitted', automatically updates to 'checking'
6. Staff member is assigned as reviewer
7. Status updates in both database and local state
8. Status column in `/checkprofile` reflects the change

### Status Transitions

- **Before:** submitted (未確認) → [stays submitted when Staff views]
- **After:** submitted (未確認) → **checking (確認中)** [auto-updates when Staff views]

## Benefits

1. **Consistent behavior** - Works the same whether navigating from `/checkprofile` or `/student`
2. **Immediate feedback** - Status updates as soon as Staff opens the profile
3. **Automatic reviewer assignment** - Staff member is automatically assigned as reviewer
4. **Better workflow** - Staff knows which profiles they're reviewing

## Testing

### Test Scenario 1: Navigate from CheckProfile

1. As Staff, go to `/checkprofile`
2. Find a student with status 未確認 (Unconfirmed)
3. Click on the student to open their profile
4. **Expected:** Status should automatically change to 確認中 (In Review)
5. Go back to `/checkprofile`
6. **Expected:** Student's status in table should now show 確認中 with blue color

### Test Scenario 2: Navigate from Student List

1. As Staff, go to `/student`
2. Find a student with submitted status
3. Click on the student
4. **Expected:** Status should automatically change to checking

### Test Scenario 3: Already Checking

1. As Staff, open a student profile that's already checking or approved
2. **Expected:** Status should remain unchanged
3. No unnecessary API calls

## Edge Cases Handled

1. **Missing staffId** - If staff ID not found in sessionStorage, auto-update is skipped
2. **API failure** - Error is logged but doesn't break the page load
3. **Non-Staff roles** - Auto-update only happens for Staff role
4. **Already checking/approved** - No redundant API calls

## Related Code

### Other places with similar logic:

- `fetchDraftData()` (line 534) - Has the original auto-checking logic
- Both functions now have identical auto-checking behavior

## Files Modified

- `portfolio-client/src/pages/Profile/Top/Top.jsx` (+24 lines)

## Compatibility

✅ Works with existing draft versioning system  
✅ Compatible with Staff/Admin Q&A and Deliverables editing  
✅ Works with merged 390-redesign status improvements  
✅ Preserves reviewer assignment functionality
