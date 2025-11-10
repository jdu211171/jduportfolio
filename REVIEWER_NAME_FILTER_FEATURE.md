# Reviewer Name Display and Filter Feature

## Summary

Added reviewer name display under the "確認中" (In Review) status with clickable filter functionality in the `/checkprofile` page.

## Features

### 1. Reviewer Name Display

- When a draft's status is "checking" (確認中), the staff member's name is displayed below the status
- Name is shown in a `<kbd>` element for visual distinction
- Tooltip shows full name and email on hover
- Only visible for "checking" status

### 2. Click-to-Filter

- Clicking on a reviewer name filters the table to show only profiles reviewed by that staff member
- Click again to deactivate the filter (toggle behavior)
- Visual feedback: kbd element is clickable

## Implementation

### Backend Changes (3 files)

#### 1. `portfolio-server/src/services/draftService.js`

**Added Staff model import:**

```javascript
const { Draft, Student, Staff, sequelize } = require('../models')
```

**Include reviewer data in query:**

```javascript
include: [
	{
		model: Draft,
		as: 'pendingDraft',
		include: [
			{
				model: Staff,
				as: 'reviewer',
				attributes: ['id', 'first_name', 'last_name', 'email'],
			},
		],
	},
]
```

**Added reviewerId filter:**

```javascript
// Process reviewerId filter
let reviewerFilter = ''
if (filter.reviewerId) {
	reviewerFilter = `AND d.reviewed_by = ${parseInt(filter.reviewerId)}`
	delete filter.reviewerId
}

// Combine with other filters
const allFilters = [combinedStatusFilter, reviewerFilter].filter(Boolean).join(' ')
```

### Frontend Changes (2 files)

#### 2. `portfolio-client/src/components/Table/Table.jsx`

**Enhanced status icon rendering:**

```javascript
const reviewer = row[header.id]?.reviewer
const showReviewer = status === 'checking' && reviewer

return (
	<div style={{ flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
		{/* Status badge */}
		<div>...</div>

		{/* Reviewer name */}
		{showReviewer && (
			<kbd
				style={{
					fontSize: '10px',
					padding: '2px 6px',
					backgroundColor: '#f5f5f5',
					border: '1px solid #d0d0d0',
					borderRadius: '4px',
					color: '#666',
					fontFamily: 'monospace',
					cursor: 'pointer',
					userSelect: 'none',
				}}
				onClick={e => {
					e.stopPropagation()
					if (header.onReviewerClick) {
						header.onReviewerClick(reviewer.id)
					}
				}}
				title={`${reviewer.first_name} ${reviewer.last_name} (${reviewer.email})`}
			>
				{reviewer.first_name} {reviewer.last_name}
			</kbd>
		)}
	</div>
)
```

#### 3. `portfolio-client/src/pages/ChekProfile/ChekProfile.jsx`

**Added reviewerId to filter state:**

```javascript
const [filterState, setFilterState] = useState({
	search: '',
	reviewerId: null, // Track active reviewer filter
})
```

**Added click handler:**

```javascript
const handleReviewerClick = reviewerId => {
	// Toggle filter: if same reviewer clicked, deactivate; otherwise activate
	setFilterState(prev => ({
		...prev,
		reviewerId: prev.reviewerId === reviewerId ? null : reviewerId,
	}))
}
```

**Added to column definition:**

```javascript
{
  id: 'draft',
  type: 'status_icon',
  statusMap: { ... },
  onReviewerClick: handleReviewerClick, // Add handler
}
```

## User Flow

### Viewing Reviewer Names

1. Staff navigates to `/checkprofile`
2. Table shows students with various statuses
3. For students with "確認中" (In Review) status:
   - Blue status badge is displayed
   - Below it, reviewer name appears in kbd style
   - Hovering shows full name and email

### Filtering by Reviewer

1. Staff clicks on a reviewer name (e.g., "John Doe")
2. Table instantly filters to show only students reviewed by John Doe
3. Filter is applied via `filterState.reviewerId`
4. Backend filters using SQL: `AND d.reviewed_by = {staffId}`
5. Click the same name again to remove filter

## Visual Design

### Status Badge

- **Position:** Center of status column
- **Style:** Colored background with icon and text
- **Colors:**
  - Unconfirmed: Orange (#ff9800)
  - **In Review: Blue (#2196f3)** ← Shows reviewer name
  - Returned: Red (#f44336)
  - Approved: Green (#4caf50)

### Reviewer Name (kbd element)

- **Position:** Directly below status badge
- **Font:** Monospace, 10px
- **Padding:** 2px 6px
- **Background:** Light gray (#f5f5f5)
- **Border:** 1px solid #d0d0d0
- **Border radius:** 4px
- **Cursor:** Pointer
- **User select:** None

## Data Flow

```
1. ChekProfile renders Table component
2. Table fetches data from /api/draft?filter={...}
3. Backend (draftService.getAll):
   - Includes Staff model as 'reviewer'
   - Applies reviewerId filter if present
4. Returns students with draft.reviewer data
5. Table renders status with reviewer name
6. Click triggers onReviewerClick(reviewerId)
7. ChekProfile updates filterState.reviewerId
8. Table re-fetches with new filter
9. Backend applies reviewerId SQL filter
10. Returns filtered results
```

## Benefits

1. **Clear Ownership:** Staff can see who's reviewing each profile
2. **Quick Filtering:** One-click to see your own reviews or others'
3. **Better Collaboration:** Teams can coordinate who reviews what
4. **Visual Clarity:** kbd style distinguishes reviewer names
5. **No Extra Clicks:** Information is inline, no need to open profiles

## Edge Cases

1. **No reviewer assigned:**

   - Name is not shown (even for checking status)
   - This shouldn't happen due to auto-assignment

2. **Multiple staff viewing:**

   - Each staff can filter by any reviewer
   - Filter is local to each user's session

3. **Status changes:**

   - If status changes from checking to approved, reviewer name disappears
   - Filter remains active but may show no results

4. **Filter persistence:**
   - Filter state is not persisted (resets on page reload)
   - Can be added later if needed

## Testing

### Test 1: Display Reviewer Name

1. As Staff, go to `/checkprofile`
2. Find a student with "確認中" status
3. Verify reviewer name appears below status
4. Hover to see tooltip with full name and email

### Test 2: Filter by Clicking

1. Click on a reviewer name
2. Verify table filters to show only that reviewer's profiles
3. Check URL or network tab for `?filter[reviewerId]=X`
4. Verify correct results returned

### Test 3: Toggle Filter

1. With filter active, click the same reviewer name again
2. Verify filter is removed
3. Verify all profiles are shown again

### Test 4: Multiple Reviewers

1. Filter by Reviewer A
2. Click on Reviewer B's name (on a different row)
3. Verify filter switches to Reviewer B
4. Verify only Reviewer B's profiles shown

## Future Enhancements

1. **Filter indicator:** Show active reviewer filter in Filter component
2. **Filter clear button:** Explicit button to clear reviewer filter
3. **Multi-reviewer filter:** Allow filtering by multiple reviewers
4. **Reviewer stats:** Show count of profiles per reviewer
5. **Color coding:** Different colors for different reviewers

## Files Modified

| File                                                     | Changes   | Purpose                                  |
| -------------------------------------------------------- | --------- | ---------------------------------------- |
| `portfolio-server/src/services/draftService.js`          | +15 lines | Include reviewer data, add filter logic  |
| `portfolio-client/src/components/Table/Table.jsx`        | +35 lines | Display reviewer name with click handler |
| `portfolio-client/src/pages/ChekProfile/ChekProfile.jsx` | +12 lines | Add filter state and click handler       |

**Total:** +62 lines across 3 files

## Compatibility

✅ Works with auto-checking status feature  
✅ Compatible with Staff/Admin editing features  
✅ Works with 390-redesign status improvements  
✅ Preserves all existing filters and functionality
