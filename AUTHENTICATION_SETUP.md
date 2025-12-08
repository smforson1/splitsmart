# Authentication Setup Guide

This guide will help you set up authentication for SplitSmart using Supabase Auth.

## Prerequisites

- A Supabase account and project
- Node.js and npm installed
- Your existing SplitSmart database

## Step 1: Enable Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Email** provider (enabled by default)
4. Optional: Enable social providers (Google, GitHub, etc.)

## Step 2: Run Database Migration

1. Open your Supabase SQL Editor
2. Run the migration file: `backend/migrations/add_authentication.sql`
3. This will add:
   - User references to groups and members tables
   - `group_members` junction table for access control
   - Necessary indexes

## Step 3: Configure Environment Variables

### Backend (.env)

Add these variables to `backend/.env`:

```env
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
PORT=3000
```

**Where to find these:**
- Go to Supabase Dashboard > Settings > API
- Copy the **Project URL** (SUPABASE_URL)
- Copy the **anon/public** key (SUPABASE_ANON_KEY)

### Frontend (.env)

Add these variables to `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Install Dependencies

The Supabase client has already been installed, but if you need to reinstall:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Step 5: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 6: Test Authentication

1. Open the app in your browser (usually http://localhost:5173)
2. You should be redirected to the login page
3. Click "Sign up" to create a new account
4. Check your email for verification (if email confirmation is enabled)
5. Sign in with your credentials

## Features Added

### User Authentication
- ✅ Email/password signup and login
- ✅ JWT token-based authentication
- ✅ Protected routes on frontend
- ✅ Secure API endpoints

### Access Control
- ✅ Users can only see their own groups
- ✅ Group creators are automatically admins
- ✅ Admin-only actions (update, delete groups)
- ✅ Member-level access for viewing and adding expenses

### Security
- ✅ All API routes require authentication
- ✅ Token validation on every request
- ✅ User-specific data isolation
- ✅ Role-based permissions

## Database Schema Changes

### New Tables
- `group_members`: Junction table linking users to groups with roles

### Modified Tables
- `groups`: Added `created_by_user_id` column
- `members`: Added `user_id` column (optional, for linking members to users)

### Roles
- **admin**: Can update/delete group, manage members, add expenses
- **member**: Can view group, add expenses

## Troubleshooting

### "Access token required" error
- Make sure you're signed in
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
- Clear browser cache and sign in again

### "Access denied to this group" error
- You don't have permission to access this group
- Make sure you're a member of the group

### Email confirmation issues
- Go to Supabase Dashboard > Authentication > Settings
- Disable "Enable email confirmations" for development
- Or set up email templates and SMTP settings

### Existing data migration
If you have existing groups without user associations:
1. Create a user account
2. Run this SQL to assign groups to that user:
```sql
UPDATE groups 
SET created_by_user_id = 'your-user-id' 
WHERE created_by_user_id IS NULL;

INSERT INTO group_members (group_id, user_id, role)
SELECT id, 'your-user-id', 'admin'
FROM groups
WHERE id NOT IN (SELECT group_id FROM group_members);
```

## Next Steps

- Set up email templates in Supabase
- Configure password reset flow
- Add social login providers
- Implement group invitations via email
- Add user profile management

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review API.md for endpoint details
- Check browser console for errors
