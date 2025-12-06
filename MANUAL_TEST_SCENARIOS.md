# Manual Testing Scenarios for Recruiter Student Search Fix

## Overview

This document provides step-by-step manual testing scenarios to verify the recruiter student search visibility fix.

## Prerequisites

- Access to the application with accounts for: Student, Staff, and Recruiter
- Test student accounts with different draft statuses

## Test Scenario 1: Student with Approved Profile (Should Appear)

### Setup

1. Log in as a test student (e.g., `student1@example.com`)
2. Edit profile and fill in:
   - Self introduction
   - Hobbies
   - Skills
   - IT Skills
   - Gallery images
   - Deliverables
3. Click "Submit for Review"
4. Log out

### Staff Action

1. Log in as staff member
2. Navigate to pending submissions
3. Find the student's submission
4. Review and click "Approve"
5. Log out

### Student Action

1. Log in as the student again
2. Navigate to profile settings
3. Toggle "Make Profile Public" to ON (visibility: true)
4. System should allow this (profile is approved)
5. Log out

### Verification (Recruiter)

1. Log in as recruiter
2. Navigate to student search
3. **Expected**: Student appears in search results
4. Click on student profile
5. **Expected**: All profile data (self intro, hobbies, skills, etc.) is visible

---

## Test Scenario 2: Student with Submitted (Not Approved) Profile (Should NOT Appear)

### Setup

1. Log in as a test student (e.g., `student2@example.com`)
2. Edit profile and fill in profile data
3. Click "Submit for Review"
4. DO NOT log in as staff to approve
5. Log out

### Student Action (Attempt to Make Public)

1. Log in as the student again
2. Navigate to profile settings
3. Try to toggle "Make Profile Public" to ON
4. **Expected**: System shows warning "Profile not approved by staff"
5. **Expected**: visibility remains false
6. Log out

### Verification (Recruiter)

1. Log in as recruiter
2. Navigate to student search
3. **Expected**: Student does NOT appear in search results

---

## Test Scenario 3: Student with Approved Profile Then New Submission (Edge Case)

### Setup

1. Complete Test Scenario 1 (student has approved, public profile)
2. Student is visible to recruiters

### Student Action (Make Changes)

1. Log in as the student
2. Edit profile and make significant changes
3. Click "Submit for Review"
4. **Note**: This creates a new pending draft with status 'submitted'
5. **Note**: visibility should still be true from before
6. Log out

### Verification (Recruiter)

1. Log in as recruiter
2. Navigate to student search
3. **Expected**: Student still appears (visibility is true)
4. Click on student profile
5. **Expected**: Profile shows the OLD approved data, NOT the new submitted changes
6. **Expected**: No incomplete or unapproved data is visible

### Staff Action (Approve New Changes)

1. Log in as staff
2. Find and approve the student's new submission
3. Log out

### Verification (Recruiter - After Approval)

1. Refresh student search or reload profile
2. **Expected**: Student's profile now shows the NEW approved changes

---

## Test Scenario 4: Staff/Admin View (Should See All In Review)

### Setup

1. Have students with different draft statuses:
   - Student A: submitted (not approved)
   - Student B: approved
   - Student C: disapproved
   - Student D: resubmission_required

### Verification (Staff)

1. Log in as staff member
2. Navigate to student submissions/profiles
3. **Expected**: Can see all students (A, B, C, D) with their pending draft data
4. **Expected**: Can see draft status for each

### Verification (Admin)

1. Log in as admin
2. Navigate to student management
3. **Expected**: Can see all students with their pending draft data
4. **Expected**: Can see draft status for each

---

## Test Scenario 5: Database Consistency Check

### Manual Database Query (For Technical Verification)

```sql
-- Check students visible to recruiters
SELECT
    s.student_id,
    s.first_name,
    s.last_name,
    s.visibility,
    d.status as pending_draft_status,
    d.version_type
FROM "Students" s
LEFT JOIN "Drafts" d ON s.student_id = d.student_id AND d.version_type = 'pending'
WHERE s.active = true AND s.visibility = true;
```

**Expected**:

- All students with `visibility = true` should have `pending_draft_status = 'approved'`
- If any student has `visibility = true` with `pending_draft_status != 'approved'`, this indicates a data inconsistency

---

## Common Issues and Troubleshooting

### Issue 1: Student Can't Make Profile Public

**Symptom**: "Profile not approved by staff" warning
**Cause**: pendingDraft status is not 'approved'
**Solution**: Staff must review and approve the student's submission first

### Issue 2: Recruiter Sees Incomplete Profile

**Symptom**: Student appears but profile fields are empty
**Cause**: visibility is true but pendingDraft status is not approved (data inconsistency)
**Solution**: This should not happen with the fix. If it does, check database consistency

### Issue 3: Profile Changes Not Visible to Recruiter

**Symptom**: Recruiter sees old data even after student made changes
**Cause**: New changes not approved yet
**Solution**: This is correct behavior - staff must approve new changes first

---

## Success Criteria

✅ Recruiters only see students with both:

- `visibility = true`
- `pendingDraft.status = 'approved'`

✅ Recruiters see complete, approved profile data

✅ Staff/Admin can see all students in any review stage

✅ Students can only make profiles public after staff approval

✅ No data inconsistencies (visibility true without approved draft)
