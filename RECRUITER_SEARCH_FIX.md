# Recruiter Student Search Visibility Fix

## Issue

Recruiters were able to see student profiles that were not yet public/approved in the student search. This was a bug where students with `visibility: true` but whose profiles had not been approved by staff were still being shown to recruiters.

## Root Cause

The `getAllStudents` method in `studentService.js` had the following issues:

1. **Wrong draft association**: The method was including the `draft` association (version_type: 'draft') instead of `pendingDraft` (version_type: 'pending')
2. **Incorrect merge logic**: Draft data was being merged for any status that was NOT 'draft', which included 'submitted', 'disapproved', etc.
3. **Missing role-based logic**: The method did not differentiate between user roles when merging draft data

## Solution

Modified the `getAllStudents` method to:

1. **Include both associations**: Now includes both `draft` and `pendingDraft` associations
2. **Role-based merging**:
   - **Recruiters**: Only merge data from `pendingDraft` if status is `'approved'`
   - **Staff/Admin**: Merge from `pendingDraft` if status is in the review workflow (`['submitted', 'approved', 'disapproved', 'resubmission_required']`)
   - **Other users**: Use `draft` version (student's working copy)

## Changes Made

### File: `portfolio-server/src/services/studentService.js`

**Before** (lines 414-441):

```javascript
const students = await Student.findAll({
	where: query,
	attributes,
	include: [
		{
			model: Draft,
			as: 'draft',
			attributes: ['id', 'status', 'profile_data'],
			required: false,
		},
	],
	order: order,
})

const studentsWithDraftData = students.map(student => {
	const studentJson = student.toJSON()
	if (studentJson.draft && studentJson.draft.profile_data && studentJson.draft.status !== 'draft') {
		const draftData = studentJson.draft.profile_data
		// ... merge logic
	}
	return studentJson
})
```

**After** (lines 414-476):

```javascript
const students = await Student.findAll({
	where: query,
	attributes,
	include: [
		{
			model: Draft,
			as: 'draft',
			attributes: ['id', 'status', 'profile_data'],
			required: false,
		},
		{
			model: Draft,
			as: 'pendingDraft',
			attributes: ['id', 'status', 'profile_data'],
			required: false,
		},
	],
	order: order,
})

const studentsWithDraftData = students.map(student => {
	const studentJson = student.toJSON()

	let shouldMergeDraft = false
	let draftToMerge = null

	if (userType === 'Recruiter') {
		// Only show approved pending drafts
		if (studentJson.pendingDraft && studentJson.pendingDraft.profile_data && studentJson.pendingDraft.status === 'approved') {
			shouldMergeDraft = true
			draftToMerge = studentJson.pendingDraft
		}
	} else if (userType === 'Staff' || userType === 'Admin') {
		// Show pending draft if in review workflow
		if (studentJson.pendingDraft && studentJson.pendingDraft.profile_data) {
			if (['submitted', 'approved', 'disapproved', 'resubmission_required'].includes(studentJson.pendingDraft.status)) {
				shouldMergeDraft = true
				draftToMerge = studentJson.pendingDraft
			}
		}
	} else {
		// Use draft version for students/guests
		if (studentJson.draft && studentJson.draft.profile_data && studentJson.draft.status !== 'draft') {
			shouldMergeDraft = true
			draftToMerge = studentJson.draft
		}
	}

	if (shouldMergeDraft && draftToMerge) {
		const draftData = draftToMerge.profile_data
		// ... merge logic
	}

	return studentJson
})
```

## Impact

- **Recruiters**: Will now only see students whose profiles have been approved by staff
- **Staff/Admin**: Can still see students in any review workflow stage
- **Students**: Continue to see their own draft versions
- **Security**: Prevents premature exposure of student profiles to recruiters

## Testing

To test this fix:

1. Create a student with `visibility: true` but `pendingDraft.status: 'submitted'` (not approved)
2. Log in as a recruiter
3. Search for students
4. Verify the student does NOT appear in search results
5. Have staff approve the student's profile (`pendingDraft.status: 'approved'`)
6. Search again as recruiter
7. Verify the student NOW appears in search results

## Related Files

- `portfolio-server/src/services/studentService.js` - Main fix
- `portfolio-server/src/models/Student.js` - Student model with draft associations
- `portfolio-server/src/models/Draft.js` - Draft model with version_type and status fields
