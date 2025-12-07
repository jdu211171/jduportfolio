# Recruiter Student Search Visibility Fix

## Issue

Recruiters were able to see student profiles that were not yet public/approved in the student search. This was a bug where students with `visibility: true` but whose profiles had not been approved by staff were still being shown to recruiters.

## Root Cause

The `getAllStudents` method in `studentService.js` had the following issues:

1. **Wrong draft association**: The method was including the `draft` association (version_type: 'draft') instead of `pendingDraft` (version_type: 'pending')
2. **Incorrect merge logic**: Draft data was being merged for any status that was NOT 'draft', which included 'submitted', 'disapproved', etc.
3. **Missing role-based logic**: The method did not differentiate between user roles when merging draft data
4. **No query-level filtering**: Students with `visibility: true` but without approved drafts were included in results (showing as empty profiles)

## Solution

Modified the `getAllStudents` method to:

1. **Add query-level filter for recruiters**: Use SQL EXISTS clause to ensure only students with approved pending drafts appear in results
2. **Include both associations**: Now includes both `draft` and `pendingDraft` associations
3. **Role-based merging**:
   - **Recruiters**: Only merge data from `pendingDraft` if status is `'approved'`
   - **Staff/Admin**: Merge from `pendingDraft` if status is in the review workflow (`['submitted', 'approved', 'disapproved', 'resubmission_required']`)
   - **Other users**: Use `draft` version (student's working copy)

## Changes Made

### File: `portfolio-server/src/services/studentService.js`

#### Change 1: Query-Level Filtering (lines 372-385)

**Before**:
```javascript
query[Op.and] = [querySearch, queryOther, { active: true }]
if (userType === 'Recruiter') {
    query[Op.and].push({ visibility: true })
}
```

**After**:
```javascript
query[Op.and] = [querySearch, queryOther, { active: true }]
if (userType === 'Recruiter') {
    query[Op.and].push({ visibility: true })
    // Only show students with approved pending drafts
    query[Op.and].push(
        sequelize.literal(`EXISTS (
            SELECT 1 
            FROM "Drafts" 
            WHERE "Drafts"."student_id" = "Student"."student_id" 
            AND "Drafts"."version_type" = 'pending' 
            AND "Drafts"."status" = 'approved'
        )`)
    )
}
```

#### Change 2: Draft Association and Merging (lines 414-476)

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

- **Recruiters**: Will now only see students who have:
  1. `visibility: true` (student made profile public)
  2. An approved `pendingDraft` (staff approved the profile)
  3. Students without approved drafts will NOT appear in search results at all
- **Staff/Admin**: Can still see ALL students in any review workflow stage (no filtering)
- **Students**: Continue to see their own draft versions
- **Security**: Prevents premature exposure of student profiles to recruiters

## Testing

To test this fix:

1. Create a student with `visibility: true` but `pendingDraft.status: 'submitted'` (not approved)
2. Log in as a recruiter
3. Search for students
4. **Verify**: The student does NOT appear in search results (filtered at query level)
5. Have staff approve the student's profile (`pendingDraft.status: 'approved'`)
6. Search again as recruiter
7. **Verify**: The student NOW appears in search results with full profile data

### Database Verification

Run this query to verify all visible students to recruiters have approved drafts:

```sql
SELECT 
    s.student_id, 
    s.first_name, 
    s.last_name,
    s.visibility, 
    d.status as pending_status,
    d.version_type
FROM "Students" s
LEFT JOIN "Drafts" d ON s.student_id = d.student_id AND d.version_type = 'pending'
WHERE s.active = true AND s.visibility = true;
```

**Expected**: All students with `visibility = true` should have `pending_status = 'approved'` to be visible to recruiters.

## Related Files

- `portfolio-server/src/services/studentService.js` - Main fix (lines 372-385, 414-476)
- `portfolio-server/src/models/Student.js` - Student model with draft associations
- `portfolio-server/src/models/Draft.js` - Draft model with version_type and status fields
