# Notification System Flow Diagram

## Overview

This document visualizes how actionable notifications work in the system.

## Notification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Action Triggers                          │
│                                                                       │
│  • Student submits draft                                            │
│  • Staff approves/rejects draft                                     │
│  • Admin publishes student profile                                  │
└────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend Notification Creation                     │
│                                                                       │
│  NotificationService.create({                                       │
│    user_id: targetUser.id,                                          │
│    user_role: 'staff'|'admin'|'student'|'recruiter',               │
│    type: 'draft_submitted'|'approved'|'etc',                       │
│    message: localizedMessage,                                       │
│    status: 'unread',                                                │
│    related_id: draft.id | student.id,                              │
│    target_url: buildNotificationUrl({ ... })  ◄─── NEW!            │
│  })                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   buildNotificationUrl Logic                         │
│                                                                       │
│  Input: { type, userRole, studentId, relatedId }                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  if (type === 'draft_submitted' && userRole === 'staff')     │  │
│  │    → /checkprofile/profile/{studentId}/top                   │  │
│  │                                                                │  │
│  │  if (type === 'approved' && userRole === 'admin')            │  │
│  │    → /checkprofile/profile/{studentId}/top                   │  │
│  │                                                                │  │
│  │  if (type === 'approved' && userRole === 'student')          │  │
│  │    → /profile/top                                             │  │
│  │                                                                │  │
│  │  if (type === 'etc' && userRole === 'recruiter')             │  │
│  │    → /student/profile/{studentId}/top                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Database: Notifications Table                     │
│                                                                       │
│  ┌────┬──────────┬──────────┬──────────┬──────────┬─────────────┐  │
│  │ id │ user_id  │ user_role│   type   │  message │  target_url │  │
│  ├────┼──────────┼──────────┼──────────┼──────────┼─────────────┤  │
│  │ 1  │  456     │  staff   │ draft_.. │ Student..│ /checkprof..│  │
│  │ 2  │  789     │  admin   │ approved │ Student..│ /checkprof..│  │
│  │ 3  │  123     │  student │ approved │ Your pr..│ /profile/top│  │
│  │ 4  │  101     │ recruiter│   etc    │ Student..│ /student/pr.│  │
│  └────┴──────────┴──────────┴──────────┴──────────┴─────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 Frontend: User Receives Notification                 │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Notification Bell Icon                                       │  │
│  │  ┌──────────┐                                                 │  │
│  │  │    🔔    │  ← Badge shows unread count                    │  │
│  │  │    (3)   │                                                 │  │
│  │  └──────────┘                                                 │  │
│  │                                                                │  │
│  │  User clicks → Dropdown appears                              │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Notifications                    [Mark all as read]    │  │  │
│  │  ├────────────────────────────────────────────────────────┤  │  │
│  │  │  [All] [Unread] [Read]                                 │  │  │
│  │  ├────────────────────────────────────────────────────────┤  │  │
│  │  │  ► Student 123 submitted profile     [NEW]  10:30 AM   │  │  │
│  │  │  ► Draft approved by staff           [NEW]  09:15 AM   │  │  │
│  │  │    Profile update completed                  Yesterday │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Frontend: handleClick Function (NEW LOGIC)              │
│                                                                       │
│  const handleClick = item => {                                      │
│    ┌──────────────────────────────────────────────────────────┐    │
│    │  if (item.target_url) {              ◄─── NEW CONDITION │    │
│    │    markAsRead(item.id)                                   │    │
│    │    setIsVisible(false)                                   │    │
│    │    setModalIsVisible(false)                              │    │
│    │    navigate(item.target_url)         ◄─── NAVIGATION    │    │
│    │    return                                                 │    │
│    │  }                                                        │    │
│    └──────────────────────────────────────────────────────────┘    │
│                                                                       │
│    ┌──────────────────────────────────────────────────────────┐    │
│    │  // Otherwise, show modal (backward compatible)          │    │
│    │  setSelectedMessage(item)                                │    │
│    │  setModalIsVisible(true)                                 │    │
│    │  markAsRead(item.id)                                     │    │
│    └──────────────────────────────────────────────────────────┘    │
│  }                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         User Navigated To:                           │
│                                                                       │
│  • Staff → /checkprofile/profile/123/top                           │
│    └─ Can review student's pending draft                           │
│                                                                       │
│  • Admin → /checkprofile/profile/123/top                           │
│    └─ Can see approved student profile                             │
│                                                                       │
│  • Student → /profile/top                                           │
│    └─ Can view their updated profile                               │
│                                                                       │
│  • Recruiter → /student/profile/123/top                            │
│    └─ Can browse newly published student profile                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Example Scenarios

### Scenario 1: Draft Submission Flow

```
Student (ID: 123) submits draft
         │
         ▼
Backend creates notification for all staff members
  - type: 'draft_submitted'
  - user_role: 'staff'
  - target_url: '/checkprofile/profile/123/top'
         │
         ▼
Staff member (ID: 456) logs in
         │
         ▼
Sees notification: "Student 123 submitted profile"
         │
         ▼
Clicks notification
         │
         ▼
Frontend navigates to: /checkprofile/profile/123/top
         │
         ▼
Staff can immediately review the draft
```

### Scenario 2: Approval Flow

```
Staff approves Student 123's draft
         │
         ├─────────────────────────┬────────────────────┐
         ▼                         ▼                    ▼
   To Student               To Admin             To Admin
   type: 'approved'        type: 'approved'     type: 'approved'
   user_role: 'student'    user_role: 'admin'   user_role: 'admin'
   target_url:             target_url:          target_url:
   '/profile/top'          '/checkprofile/      '/checkprofile/
                           profile/123/top'     profile/123/top'
         │                         │                    │
         ▼                         ▼                    ▼
   Student clicks           Admin clicks           Admin clicks
   → Their profile          → Review page          → Review page
```

### Scenario 3: Profile Publication Flow

```
Admin makes Student 123's profile public
         │
         ▼
Backend creates notifications for all recruiters
  - type: 'etc'
  - user_role: 'recruiter'
  - target_url: '/student/profile/123/top'
         │
         ▼
Recruiter (ID: 101) logs in
         │
         ▼
Sees notification: "Student 123 profile published"
         │
         ▼
Clicks notification
         │
         ▼
Frontend navigates to: /student/profile/123/top
         │
         ▼
Recruiter can view student's public profile
```

## Key Benefits

1. **One-Click Access**: Users reach relevant context immediately
2. **Reduced Friction**: No manual navigation or searching required
3. **Context Awareness**: Different user roles see appropriate URLs
4. **Backward Compatible**: Old notifications still work
5. **Centralized Logic**: Easy to maintain and extend

## Implementation Summary

```
Backend (4 files changed)
├── Migration: Add target_url column
├── Model: Update Notification definition
├── Utility: buildNotificationUrl()
└── Controllers: Include target_url in all notifications

Frontend (1 file changed)
└── Notifications.jsx: Navigate on click if target_url exists
```

## URL Mapping Reference

| Notification Type | User Role   | Target URL                              | Use Case                      |
| ----------------- | ----------- | --------------------------------------- | ----------------------------- |
| `draft_submitted` | `staff`     | `/checkprofile/profile/{studentId}/top` | Review pending student draft  |
| `approved`        | `admin`     | `/checkprofile/profile/{studentId}/top` | View approved student profile |
| `approved`        | `student`   | `/profile/top`                          | View own updated profile      |
| `etc` (published) | `recruiter` | `/student/profile/{studentId}/top`      | Browse newly public student   |

## Notes

- Notifications without `target_url` (old or special cases) still show modal
- Navigation happens after marking as read
- Dropdown and modal close automatically on navigation
- Works across all languages (multilingual message format preserved)
