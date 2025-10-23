# News Visibility System Refactor - Summary

## Overview

Successfully refactored the news visibility system from a toggle switch to radio buttons for better clarity and user experience.

## Changes Summary

### 1. User Interface Changes

#### Before:

- Toggle switch labeled "Visible to recruiter" (採用担当者に表示)
- Confusing because the label didn't clearly explain the visibility implications
- Default value: `false` (hidden from recruiters)

#### After:

- Radio buttons with two clear options:
  1. **University News (大学ニュース)**: "Visible to everyone (staff, admin, students, recruiters)"
  2. **Recruiter News (リクルーターニュース)**: "Visible to everyone except recruiters"
- Clear descriptions explain who can see each type
- Default value: `true` (University News - visible to everyone)
- Better visual hierarchy with FormControl and FormLabel

### 2. Badge Display

#### Before:

- Showed "Recruiter" badge only when `visible_to_recruiter === true`
- Inconsistent - no badge shown for other news

#### After:

- Always shows news visibility type with color-coded badges:
  - **University News**: Blue badge (#E3F2FD background, #1976D2 text)
  - **Recruiter News**: Orange badge (#FFF3E0 background, #E65100 text)
- Consistent display for all news items

### 3. Files Modified

#### `portfolio-client/src/locales/translations.js`

Added new translation keys in 4 languages:

- `newsVisibility`: Form field label
- `universityNews`: Radio option label
- `universityNewsDescription`: Radio option description
- `recruiterNews`: Radio option label
- `recruiterNewsDescription`: Radio option description

Languages supported: English, Japanese, Uzbek, Russian

#### `portfolio-client/src/pages/news/NewsForAdmin.jsx`

- Replaced `Switch` component with `RadioGroup`
- Added imports: `FormControl`, `FormLabel`, `Radio`, `RadioGroup`
- Updated default state value from `false` to `true`
- Updated badge rendering logic to show appropriate badge for all news items
- Updated all state reset locations (create dialog, edit dialog, cancel buttons)

## Technical Details

### Data Model (Unchanged)

```javascript
visible_to_recruiter: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true,
  comment: 'Recruiter uchun korinishi',
}
```

### Backend Logic (Unchanged)

The backend service (`portfolio-server/src/services/newsService.js`) already implements the correct filtering:

```javascript
// For recruiters
if (user.userType === 'Recruiter') {
	finalConditions.push({
		[Op.or]: [
			{
				status: 'approved',
				visible_to_recruiter: true, // Can see University News
			},
			{
				authorId: user.id,
				authorType: 'Recruiter',
				status: { [Op.in]: ['pending', 'rejected'] },
			},
		],
	})
}
```

### Mapping

- `visible_to_recruiter: true` → **University News** → Visible to everyone including recruiters
- `visible_to_recruiter: false` → **Recruiter News** → Hidden from recruiters

## Testing & Validation

✅ **Build Status**: Frontend builds successfully without errors
✅ **Linting**: No new linting errors introduced
✅ **Security**: CodeQL scan completed with 0 alerts
✅ **Formatting**: All files pass Prettier checks
✅ **Backend Compatibility**: No API or database changes required

## Migration Notes

### For Existing Data

No data migration needed. The boolean field remains the same:

- Existing news with `visible_to_recruiter: true` will display as "University News"
- Existing news with `visible_to_recruiter: false` will display as "Recruiter News"

### For Users

- Admins and staff will see the new radio button interface when creating/editing news
- The default selection is now "University News" (visible to all)
- All news items now display a badge indicating their visibility type

## UI/UX Improvements

1. **Clarity**: Radio buttons with descriptions make the visibility options much clearer
2. **Consistency**: All news items now show their visibility type via badges
3. **Visual Hierarchy**: Form labels and descriptions provide better context
4. **Color Coding**: Blue and orange badges help quickly identify news types
5. **Default Selection**: University News as default is more intuitive for university-wide announcements

## Screenshots Needed

To complete the documentation, the following screenshots should be captured:

1. Create News dialog showing radio buttons
2. Edit News dialog showing radio buttons
3. News list showing both types of badges
4. News list in different languages (Japanese, Uzbek, Russian)

## Future Enhancements

Potential improvements for consideration:

1. Add filtering by news visibility type in the news list
2. Add statistics showing distribution of University News vs Recruiter News
3. Consider adding a third option for "Staff Only" news if needed
