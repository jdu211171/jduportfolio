# Test Student Accounts

## Overview

This document describes the test student accounts created for development and testing purposes.

## Purpose

- Provide stable, predictable test accounts that won't change
- Easy to remember credentials for quick login during development
- Consistent data format for testing notifications, drafts, and other features

## Seeder File

**Location**: `portfolio-server/seeders/20251111154300-test-student-accounts.js`

## Running the Seeder

### Install Accounts

```bash
cd portfolio-server
npm run seed
```

Or run specific seeder:

```bash
cd portfolio-server
npx sequelize-cli db:seed --seed 20251111154300-test-student-accounts.js
```

### Remove Accounts

```bash
cd portfolio-server
npm run unseed
```

Or remove specific seeder:

```bash
cd portfolio-server
npx sequelize-cli db:seed:undo --seed 20251111154300-test-student-accounts.js
```

## Account Details

### Email Pattern

- **Primary account**: `student@jdu.uz`
- **Numbered accounts**: `student01@jdu.uz` through `student09@jdu.uz`

### Password

**All accounts use the same password**: `1234`

### Student IDs

- `TEST00` (for student@jdu.uz)
- `TEST01` through `TEST09` (for numbered accounts)

### Account List

| Email            | Password | Student ID | Name           |
| ---------------- | -------- | ---------- | -------------- |
| student@jdu.uz   | 1234     | TEST00     | Test00 Student |
| student01@jdu.uz | 1234     | TEST01     | Test01 Student |
| student02@jdu.uz | 1234     | TEST02     | Test02 Student |
| student03@jdu.uz | 1234     | TEST03     | Test03 Student |
| student04@jdu.uz | 1234     | TEST04     | Test04 Student |
| student05@jdu.uz | 1234     | TEST05     | Test05 Student |
| student06@jdu.uz | 1234     | TEST06     | Test06 Student |
| student07@jdu.uz | 1234     | TEST07     | Test07 Student |
| student08@jdu.uz | 1234     | TEST08     | Test08 Student |
| student09@jdu.uz | 1234     | TEST09     | Test09 Student |

## Profile Data

Each test account includes:

- **Basic Info**: Name, furigana, date of birth, gender
- **Contact**: Phone, address, parent's phone
- **Academic**: Enrollment dates, semester, university, faculty, department
- **Credits**: Sample credit data across various categories
- **Status**: Active student status
- **Visibility**: Hidden by default (not public)
- **Self Introduction**: Simple text identifying it as a test account

## Features

### Idempotent

The seeder checks if test accounts already exist before inserting. Re-running the seeder will not create duplicates.

```javascript
// Check before insertion
const existingStudents = await queryInterface.sequelize.query(`SELECT email FROM "Students" WHERE email LIKE 'student%@jdu.uz'`, { type: Sequelize.QueryTypes.SELECT })

if (existingStudents.length > 0) {
	console.log('Test student accounts already exist. Skipping insertion.')
	return
}
```

### Easy to Remember

- Email: Simple pattern with sequential numbers
- Password: Simple 4-digit code (`1234`)
- Student ID: Clear test prefix (`TEST00-09`)

### Minimal Schema Changes

The seeder only inserts data into existing `Students` table. No schema changes required.

## Usage Examples

### Login Testing

1. Navigate to login page
2. Enter email: `student@jdu.uz`
3. Enter password: `1234`
4. Click login

### Testing Notifications

1. Login as staff/admin
2. Create notifications for test students
3. Login as `student01@jdu.uz` (password: `1234`)
4. Verify notifications appear

### Testing Draft Submissions

1. Login as `student@jdu.uz` (password: `1234`)
2. Edit profile and submit draft
3. Login as staff to review
4. Approve/reject draft
5. Login back as student to see notification

### Testing Multiple Students

Use different numbered accounts to test:

- Student list pagination
- Search functionality
- Bulk operations
- Role-based access

## Cleanup

To remove all test accounts:

```bash
cd portfolio-server
npx sequelize-cli db:seed:undo --seed 20251111154300-test-student-accounts.js
```

This will delete all students with emails matching `student%@jdu.uz` pattern.

## Security Notes

⚠️ **Important**: These are test accounts with simple passwords.

- **Do NOT use in production**
- **Only for development/testing environments**
- Accounts are marked as `visibility: false` and `is_public: false` by default
- Clear indication in profile (`other_information`) that these are test accounts

## Troubleshooting

### Duplicate Key Errors

If you see unique constraint violations:

1. Check if accounts already exist:

   ```sql
   SELECT email, student_id FROM "Students" WHERE email LIKE 'student%@jdu.uz';
   ```

2. Remove existing test accounts:

   ```bash
   npm run unseed
   ```

3. Re-run seeder:
   ```bash
   npm run seed
   ```

### Password Not Working

The password is hashed with bcrypt. If login fails:

1. Verify the seeder ran successfully
2. Check console output for success message
3. Try removing and re-running the seeder

### Accounts Not Visible

Test accounts are hidden by default (`visibility: false`). To make them visible:

1. Login as admin
2. Navigate to student management
3. Update `visibility` field to `true`

Or update directly in database:

```sql
UPDATE "Students"
SET visibility = true, is_public = true
WHERE email LIKE 'student%@jdu.uz';
```

## Development Workflow

### Initial Setup

```bash
# Install dependencies
cd portfolio-server
npm install

# Run migrations
npm run migrate

# Run all seeders (including test students)
npm run seed
```

### Daily Development

Just login with any test account:

- Email: `student@jdu.uz`
- Password: `1234`

### Reset Test Data

```bash
# Remove all seed data
npm run unseed

# Re-seed everything
npm run seed
```

## Notes

- Seeder follows existing naming convention: `YYYYMMDDHHMMSS-description.js`
- Uses bcrypt for password hashing (same as production)
- Compatible with existing student schema
- Can be run alongside other seeders
- Automatically skips if accounts exist (safe to re-run)

## Related Files

- Seeder: `portfolio-server/seeders/20251111154300-test-student-accounts.js`
- Student Model: `portfolio-server/src/models/Student.js`
- Existing Demo Students: `portfolio-server/seeders/20240624192110-demo-students.js`

## Questions?

If you need more test accounts or different configurations, edit the seeder file and adjust:

- Number of accounts (change loop count)
- Email pattern (modify email template)
- Password (change the hashed password)
- Profile data (update student object properties)
