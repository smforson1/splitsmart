# Google Authentication Setup Guide

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "SplitSmart" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click on it and click **Enable**

4. **Configure OAuth Consent Screen**
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** (unless you have a Google Workspace)
   - Click **Create**
   - Fill in the required fields:
     - App name: `SplitSmart`
     - User support email: Your email
     - Developer contact email: Your email
   - Click **Save and Continue**
   - Skip the Scopes section (click **Save and Continue**)
   - Add test users if needed (for development)
   - Click **Save and Continue**

5. **Create OAuth Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `SplitSmart Web Client`
   - **Authorized JavaScript origins:**
     - For development: `http://localhost:5173`
     - For production: `https://your-domain.com`
   - **Authorized redirect URIs:**
     - Add: `https://vrfqvrhahscjavwmbngw.supabase.co/auth/v1/callback`
     - (Replace with your Supabase project URL)
   - Click **Create**
   - **Copy the Client ID and Client Secret** (you'll need these next)

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Enable Google Provider**
   - Go to **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON**

3. **Add Google Credentials**
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console
   - Click **Save**

## Step 3: Update Redirect URL in Google Cloud

If you haven't already, make sure your Google OAuth redirect URI matches your Supabase callback URL:

**Format:** `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

**Your URL:** `https://vrfqvrhahscjavwmbngw.supabase.co/auth/v1/callback`

Add this to the **Authorized redirect URIs** in Google Cloud Console.

## Step 4: Test the Integration

1. **Restart your frontend** (if it's running)
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test Sign In**
   - Go to http://localhost:5173/login
   - Click "Continue with Google"
   - You should be redirected to Google's sign-in page
   - After signing in, you'll be redirected back to your app

3. **Test Sign Up**
   - Go to http://localhost:5173/signup
   - Click "Continue with Google"
   - Same flow as sign in

## For Production Deployment

When deploying to production (e.g., Vercel):

1. **Update Google OAuth Credentials**
   - Add your production domain to **Authorized JavaScript origins**
   - Example: `https://splitsmart.vercel.app`

2. **Update Supabase Site URL**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Set **Site URL** to your production URL
   - Example: `https://splitsmart.vercel.app`

3. **Update Redirect URLs**
   - The Supabase callback URL remains the same
   - Just add your production domain to Google OAuth origins

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://vrfqvrhahscjavwmbngw.supabase.co/auth/v1/callback`
- No trailing slashes
- Check for typos

### "Access blocked: This app's request is invalid"
- Make sure you've enabled the Google+ API
- Check that your OAuth consent screen is configured
- Add yourself as a test user if the app is not published

### User redirected but not signed in
- Check browser console for errors
- Make sure your Supabase URL and anon key are correct in `.env`
- Clear browser cache and cookies

### "Origin not allowed"
- Add your development URL (`http://localhost:5173`) to Authorized JavaScript origins
- Add your production URL when deploying

## Benefits of Google Authentication

✅ **No password to remember** - Users sign in with their Google account
✅ **Faster signup** - One click instead of filling out a form
✅ **No email verification needed** - Google already verified the email
✅ **More secure** - Leverages Google's security infrastructure
✅ **Better user experience** - Familiar and trusted sign-in method

## What's Already Implemented

✅ Google sign-in button on login page
✅ Google sign-up button on signup page
✅ Beautiful UI with Google logo
✅ Loading states during OAuth flow
✅ Automatic redirect after authentication
✅ Works alongside email/password authentication

Users can now choose to sign in with either:
- Email and password
- Google account

Both methods work seamlessly with your existing authentication system!
