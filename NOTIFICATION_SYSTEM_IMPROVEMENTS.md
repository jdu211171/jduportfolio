# Notification System Improvements

## Overview

The notification system has been enhanced to make notifications **actionable**. Users can now click on notifications to navigate directly to the relevant context (e.g., student profile, draft review page).

## Changes Made

### Backend Changes

#### 1. Database Migration

- **File**: `portfolio-server/migrations/20251110053300-add-target-url-to-notifications.js`
- **Change**: Added `target_url` column to `Notifications` table
- **Type**: `VARCHAR(255)`, nullable
- **Purpose**: Store the URL users should be redirected to when clicking a notification

#### 2. Notification Model Update

- **File**: `portfolio-server/src/models/Notification.js`
- **Change**: Added `target_url` field to the Sequelize model definition
- **Impact**: All notification records can now store and retrieve target URLs

#### 3. URL Builder Utility

- **File**: `portfolio-server/src/utils/notificationUrlBuilder.js`
- **Purpose**: Centralized logic for generating context-aware URLs based on notification type and user role
- **Function**: `buildNotificationUrl({ type, userRole, studentId, relatedId })`

**URL Mapping Logic**:

| Notification Type         | User Role   | Target URL                              |
| ------------------------- | ----------- | --------------------------------------- |
| `draft_submitted`         | `staff`     | `/checkprofile/profile/{studentId}/top` |
| `approved`                | `admin`     | `/checkprofile/profile/{studentId}/top` |
| `approved`                | `student`   | `/profile/top`                          |
| `etc` (profile published) | `recruiter` | `/student/profile/{studentId}/top`      |

#### 4. Controller Updates

**Draft Controller** (`portfolio-server/src/controllers/draftController.js`):

- Added `buildNotificationUrl` import
- Updated all `NotificationService.create()` calls to include `target_url` field
- Notifications updated:
  - Draft submission → Staff notifications
  - Draft approval → Admin notifications (2 places)
  - Status change → Student notifications

**Student Controller** (`portfolio-server/src/controllers/studentController.js`):

- Added `buildNotificationUrl` import to the visibility change notification block
- Updated recruiter notifications when a student profile becomes public
- Includes target URL pointing to the newly published student profile

### Frontend Changes

#### Notifications Component

- **File**: `portfolio-client/src/components/Notification/Notifications.jsx`
- **Changes**:
  1. Added `useNavigate` hook from `react-router-dom`
  2. Updated `handleClick` function to check for `target_url`
  3. If `target_url` exists:
     - Mark notification as read
     - Close notification dropdown and modal
     - Navigate to the target URL
     - Skip showing the modal
  4. If `target_url` is null/undefined:
     - Show modal as before (backward compatibility)

## Usage Examples

### Example 1: Student Submits Draft for Review

**Trigger**: Student submits their profile draft

**Backend**:

```javascript
await NotificationService.create({
	user_role: 'staff',
	type: 'draft_submitted',
	message: '学生123からプロフィール情報が送信されました',
	status: 'unread',
	related_id: pendingDraft.id,
	target_url: '/checkprofile/profile/123/top',
	user_id: staff.id,
})
```

**Frontend Behavior**:

- Staff member sees notification
- Clicks on notification
- Immediately navigated to `/checkprofile/profile/123/top`
- Can review the student's pending draft

### Example 2: Staff Approves Draft

**Trigger**: Staff approves a student's profile draft

**Notifications Created**:

1. **To Student**:

   - Message: Status changed to "Approved"
   - Target URL: `/profile/top`
   - Click → Student sees their updated profile

2. **To Admin**:
   - Message: Student profile approved
   - Target URL: `/checkprofile/profile/123/top`
   - Click → Admin can review the approval

### Example 3: Student Profile Published

**Trigger**: Admin makes student profile public

**Backend**:

```javascript
await NotificationService.create({
	user_id: recruiter.id,
	user_role: 'recruiter',
	type: 'etc',
	status: 'unread',
	message: '学生 (ID: 123) のプロフィールが公開されました。',
	related_id: student.id,
	target_url: '/student/profile/123/top',
})
```

**Frontend Behavior**:

- Recruiter sees notification
- Clicks on notification
- Navigated to `/student/profile/123/top`
- Can view the newly published student profile

## Testing Instructions

### Prerequisites

1. Set up the development environment
2. Run database migrations: `npm run migrate` in `portfolio-server`
3. Start the backend: `npm run dev` in `portfolio-server`
4. Start the frontend: `npm run dev` in `portfolio-client`

### Test Cases

#### Test 1: Draft Submission Notification (Staff)

1. Login as a student
2. Edit profile and submit draft for review
3. Logout and login as staff
4. Click on notification bell
5. Click on the "Student submitted profile" notification
6. **Expected**: Redirected to `/checkprofile/profile/{studentId}/top`
7. **Verify**: Can see student's pending draft

#### Test 2: Approval Notification (Student)

1. Login as staff
2. Go to checkprofile page
3. Approve a student's draft
4. Logout and login as the student
5. Click on notification bell
6. Click on the "Profile approved" notification
7. **Expected**: Redirected to `/profile/top`
8. **Verify**: Can see updated profile

#### Test 3: Approval Notification (Admin)

1. Login as staff
2. Approve a student's draft
3. Logout and login as admin
4. Click on notification bell
5. Click on the "Student profile approved" notification
6. **Expected**: Redirected to `/checkprofile/profile/{studentId}/top`
7. **Verify**: Can review the approved student profile

#### Test 4: Published Profile Notification (Recruiter)

1. Login as admin
2. Make a student profile public (set visibility to true)
3. Logout and login as recruiter
4. Click on notification bell
5. Click on the "Student profile published" notification
6. **Expected**: Redirected to `/student/profile/{studentId}/top`
7. **Verify**: Can view the student's public profile

#### Test 5: Backward Compatibility

1. Check notifications created before this update (no `target_url`)
2. Click on such a notification
3. **Expected**: Modal opens showing notification details
4. **Verify**: No navigation occurs, modal functions as before

### Manual Testing Checklist

- [ ] Draft submission → Staff can navigate to checkprofile
- [ ] Draft approval → Student can navigate to their profile
- [ ] Draft approval → Admin can navigate to checkprofile
- [ ] Profile publication → Recruiter can navigate to student list
- [ ] Old notifications without target_url still work (show modal)
- [ ] Notification is marked as read after clicking
- [ ] Dropdown closes after navigation
- [ ] Navigation works across all languages (JA/EN/UZ/RU)

## Design Considerations

### 1. Minimal UI Changes

- No visible changes to notification items or modal
- Navigation happens transparently on click
- Users get immediate context switch

### 2. Backward Compatibility

- Old notifications without `target_url` still work
- Modal fallback for notifications that don't need navigation
- No breaking changes to existing notification flow

### 3. Extensibility

- `buildNotificationUrl()` can be easily extended for new notification types
- Centralized URL logic makes maintenance easier
- New notification types just need to add a case in the utility function

### 4. User Experience

- One-click access to relevant context
- No need to manually search for related entities
- Reduces friction in workflow

## Future Enhancements

1. **Add More Notification Types**

   - Comment notifications
   - QA update notifications
   - News notifications
   - System announcements

2. **Rich Notification Actions**

   - Multiple action buttons per notification
   - Inline actions (approve/reject from notification)
   - Quick preview without full navigation

3. **Notification Preferences**

   - User settings for notification types
   - Email/in-app toggle
   - Frequency controls

4. **Analytics**
   - Track notification click-through rates
   - Measure effectiveness of different notification types
   - User engagement metrics

## Migration Guide

### For Production Deployment

1. **Run Migration**:

   ```bash
   cd portfolio-server
   npm run migrate
   ```

2. **Verify Migration**:

   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'Notifications';
   ```

   Should show `target_url` column

3. **Deploy Backend**: Deploy updated controllers and utility
4. **Deploy Frontend**: Deploy updated Notifications component
5. **Test**: Run through test cases in production environment

### Rollback Plan

If issues arise:

1. **Code Rollback**: Revert to previous version
2. **Database Rollback** (if needed):
   ```bash
   npm run migratedown
   ```
   This will remove the `target_url` column

The system is backward compatible, so rolling back code won't break existing notifications.

## Summary

The notification system is now **actionable and context-aware**:

- ✅ Minimal code changes
- ✅ Backward compatible
- ✅ Centralized URL logic
- ✅ Improved user experience
- ✅ Easy to extend

Users can now navigate directly from notifications to the relevant pages, making the notification system an integral part of the workflow rather than just an informational feature.
