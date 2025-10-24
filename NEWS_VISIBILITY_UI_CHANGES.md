# News Visibility UI Changes - Visual Documentation

## UI Component Changes

### Before: Toggle Switch

```jsx
<FormControlLabel control={<Switch checked={newNews.visible_to_recruiter} onChange={e => handleInputChange('visible_to_recruiter', e.target.checked)} color='success' />} label={t('visibleToRecruiter')} />
```

**Visual Representation:**

```
┌─────────────────────────────────────────┐
│ □ Visible to recruiter                  │
│   └── Switch (ON/OFF)                   │
└─────────────────────────────────────────┘
```

**Problems:**

- Unclear what "OFF" means (hidden from recruiters? visible to recruiters?)
- Binary choice doesn't explain implications
- Default was FALSE (hidden from recruiters) - not intuitive

---

### After: Radio Button Group

```jsx
<FormControl component='fieldset'>
	<FormLabel component='legend'>{t('newsVisibility')}</FormLabel>
	<RadioGroup value={newNews.visible_to_recruiter ? 'university' : 'recruiter'} onChange={e => handleInputChange('visible_to_recruiter', e.target.value === 'university')}>
		<FormControlLabel value='university' control={<Radio />} label={`${t('universityNews')} - ${t('universityNewsDescription')}`} />
		<FormControlLabel value='recruiter' control={<Radio />} label={`${t('recruiterNews')} - ${t('recruiterNewsDescription')}`} />
	</RadioGroup>
</FormControl>
```

**Visual Representation:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ News Visibility                                                              │
│                                                                              │
│ ◉ University News - Visible to everyone (staff, admin, students, recruiters)│
│ ○ Recruiter News - Visible to everyone except recruiters                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Improvements:**

- Clear label: "News Visibility"
- Two mutually exclusive options
- Each option has a descriptive label explaining who can see it
- Default is "University News" (visible to all) - more intuitive
- Users understand exactly what each choice means

---

## Badge Display Changes

### Before

```jsx
{
	news.visible_to_recruiter && (
		<Chip
			label='Recruiter'
			size='small'
			style={{
				backgroundColor: '#E8F5E9',
				color: '#2E7D32',
				fontWeight: 600,
				fontSize: '12px',
				borderRadius: '8px',
			}}
		/>
	)
}
{
	news.type
}
```

**Visual Representation:**

```
News List:
┌─────────────────────────────────┐
│ [Image]                         │
│ Title                           │
│ Description...                  │
│                                 │
│ [Recruiter] university          │  ← Only shown if visible_to_recruiter = true
│ 2024-10-23                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [Image]                         │
│ Title                           │
│ Description...                  │
│                                 │
│ university                      │  ← No badge when visible_to_recruiter = false
│ 2024-10-23                      │
└─────────────────────────────────┘
```

**Problems:**

- Inconsistent display (badge only shown sometimes)
- "Recruiter" label is ambiguous (for recruiters? about recruiters?)
- No visual indicator for non-recruiter news

---

### After

```jsx
;<Chip
	label={news.visible_to_recruiter ? t('universityNews') : t('recruiterNews')}
	size='small'
	style={{
		backgroundColor: news.visible_to_recruiter ? '#E3F2FD' : '#FFF3E0',
		color: news.visible_to_recruiter ? '#1976D2' : '#E65100',
		fontWeight: 600,
		fontSize: '12px',
		borderRadius: '8px',
		marginBottom: '4px',
	}}
/>
{
	news.type
}
```

**Visual Representation:**

```
News List:
┌─────────────────────────────────┐
│ [Image]                         │
│ Title                           │
│ Description...                  │
│                                 │
│ [University News] university    │  ← Blue badge (visible_to_recruiter = true)
│ 2024-10-23                      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [Image]                         │
│ Title                           │
│ Description...                  │
│                                 │
│ [Recruiter News] university     │  ← Orange badge (visible_to_recruiter = false)
│ 2024-10-23                      │
└─────────────────────────────────┘
```

**Improvements:**

- Badge always displayed (consistent UI)
- Clear labels: "University News" or "Recruiter News"
- Color coding for quick visual identification:
  - 🔵 Blue: University News (visible to all including recruiters)
  - 🟠 Orange: Recruiter News (hidden from recruiters)
- Better information architecture

---

## Translation Keys

### English

| Key                       | Value                                                    |
| ------------------------- | -------------------------------------------------------- |
| newsVisibility            | News Visibility                                          |
| universityNews            | University News                                          |
| universityNewsDescription | Visible to everyone (staff, admin, students, recruiters) |
| recruiterNews             | Recruiter News                                           |
| recruiterNewsDescription  | Visible to everyone except recruiters                    |

### Japanese (日本語)

| Key                       | Value                                          |
| ------------------------- | ---------------------------------------------- |
| newsVisibility            | ニュース表示設定                               |
| universityNews            | 大学ニュース                                   |
| universityNewsDescription | 全員に表示（教職員、管理者、学生、採用担当者） |
| recruiterNews             | リクルーターニュース                           |
| recruiterNewsDescription  | 採用担当者以外の全員に表示                     |

### Uzbek (O'zbek)

| Key                       | Value                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| newsVisibility            | Yangilik ko'rinishi                                                |
| universityNews            | Universitet yangiliklari                                           |
| universityNewsDescription | Hammaga ko'rinadi (xodimlar, adminlar, talabalar, ish beruvchilar) |
| recruiterNews             | Ish beruvchi yangiliklari                                          |
| recruiterNewsDescription  | Ish beruvchilardan tashqari hammaga ko'rinadi                      |

### Russian (Русский)

| Key                       | Value                                                        |
| ------------------------- | ------------------------------------------------------------ |
| newsVisibility            | Видимость новостей                                           |
| universityNews            | Университетские новости                                      |
| universityNewsDescription | Видны всем (сотрудники, администраторы, студенты, рекрутеры) |
| recruiterNews             | Новости для рекрутеров                                       |
| recruiterNewsDescription  | Видны всем, кроме рекрутеров                                 |

---

## Color Palette

### University News Badge

- Background: `#E3F2FD` (Light Blue 50)
- Text: `#1976D2` (Blue 700)
- Represents: News visible to everyone including recruiters

### Recruiter News Badge

- Background: `#FFF3E0` (Orange 50)
- Text: `#E65100` (Deep Orange 900)
- Represents: News visible to everyone EXCEPT recruiters

---

## User Flow Comparison

### Creating News - Before

1. Admin opens "Create News" dialog
2. Fills in title, description, image, hashtags
3. Sees toggle: "Visible to recruiter" (OFF by default)
4. May not understand what OFF means
5. Creates news (hidden from recruiters by default - probably not intended)

### Creating News - After

1. Admin opens "Create News" dialog
2. Fills in title, description, image, hashtags
3. Sees "News Visibility" section with two clear options:
   - ◉ University News - Visible to everyone (selected by default)
   - ○ Recruiter News - Visible to everyone except recruiters
4. Understands exactly who will see the news
5. Creates news (visible to all by default - more intuitive)

---

## Accessibility Improvements

1. **Better Labels**: FormLabel provides semantic structure
2. **Radio Group**: Standard HTML input type with proper ARIA attributes
3. **Descriptions**: Each option includes explanatory text
4. **Color + Text**: Not relying solely on color (also uses text labels)
5. **Keyboard Navigation**: Radio buttons fully keyboard accessible

---

## Mobile Responsiveness

The radio buttons stack vertically by default, making them mobile-friendly:

```
Mobile View (< 600px):
┌─────────────────────────┐
│ News Visibility         │
│                         │
│ ◉ University News       │
│   Visible to everyone   │
│   (staff, admin,        │
│   students, recruiters) │
│                         │
│ ○ Recruiter News        │
│   Visible to everyone   │
│   except recruiters     │
└─────────────────────────┘
```
