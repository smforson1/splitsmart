# SplitSmart Deployment Guide

Complete guide to deploy SplitSmart to production using Render (backend) and Vercel (frontend).

## 🎯 Overview

This guide will walk you through deploying your SplitSmart application to the web using:
- **Render** for the backend API (Express.js + Node.js)
- **Vercel** for the frontend (React + Vite)
- **Supabase** for the PostgreSQL database

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] GitHub account with your SplitSmart code pushed
- [ ] Supabase account (free tier)
- [ ] OpenAI API key
- [ ] Render account (free tier)
- [ ] Vercel account (free tier)

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `splitsmart-db`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

### 1.2 Setup Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `backend/database_schema.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** to create all tables
6. You should see success messages for each table created

### 1.3 Run Authentication Migration

1. Still in SQL Editor, create another new query
2. Copy the contents of `backend/migrations/add_authentication.sql`
3. Paste and run it
4. This adds authentication-related tables and columns

### 1.4 Get Database Credentials

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Copy the **URI** format connection string
4. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Go to **Settings** → **API**
6. Copy the **Project URL** (e.g., `https://[PROJECT-REF].supabase.co`)
7. Copy the **anon public** key
8. Save all three values - you'll need them later

## 🚀 Step 2: Backend Deployment (Render)

### 2.1 Prepare Your Code

1. Make sure your code is pushed to GitHub:
```bash
cd splitsmart
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create Render Web Service

1. Go to [https://render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** to link your GitHub
4. Find and select your `splitsmart` repository
5. Click **"Connect"**

### 2.3 Configure Backend Service

Fill in the deployment settings:

**Basic Settings:**
- **Name**: `splitsmart-api`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Pricing:**
- **Instance Type**: `Free` (0.1 CPU, 512 MB RAM)

### 2.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=sk-your_openai_key_here
PORT=10000
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual Supabase values
- Use `PORT=10000` (Render's default port)
- Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 2.5 Deploy Backend

1. Click **"Create Web Service"**
2. Render will start building your backend
3. This takes 3-5 minutes
4. Watch the logs for any errors
5. Once complete, you'll get a URL like: `https://splitsmart-api.onrender.com`

### 2.6 Test Backend

1. Copy your backend URL from Render dashboard
2. Visit: `https://your-backend-url.onrender.com/health`
3. You should see:
```json
{
  "status": "ok",
  "message": "SplitSmart API is running"
}
```

If you see this, your backend is working! 🎉

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Project

1. Go to [https://vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** next to your `splitsmart` repository
4. If not listed, click **"Import Git Repository"** and enter your GitHub URL

### 3.2 Configure Frontend Project

**Project Settings:**
- **Project Name**: `splitsmart` (or your preferred name)
- **Framework Preset**: `Vite` (should auto-detect)
- **Root Directory**: Click **"Edit"** → Select `frontend`
- **Build Command**: `npm run build` (should auto-fill)
- **Output Directory**: `dist` (should auto-fill)
- **Install Command**: `npm install` (should auto-fill)

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Critical:** Replace `your-backend-url.onrender.com` with your actual Render backend URL from Step 2.5!

### 3.4 Deploy Frontend

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. This takes 2-3 minutes
4. Once complete, you'll get a URL like: `https://splitsmart.vercel.app`

### 3.5 Test Frontend

1. Visit your Vercel URL
2. The SplitSmart homepage should load
3. Try creating a test group
4. If everything works, you're live! 🚀

## 🔐 Step 4: Configure Authentication

### 4.1 Enable Supabase Auth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should already be enabled
3. For easier testing, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Uncheck **"Enable email confirmations"**
   - Click **"Save"**

### 4.2 Configure Site URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel frontend URL: `https://splitsmart.vercel.app`
3. Add **Redirect URLs**:
   - `https://splitsmart.vercel.app/**`
   - `http://localhost:5173/**` (for local development)
4. Click **"Save"**

### 4.3 Optional: Setup Google OAuth

If you want Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `https://[PROJECT-REF].supabase.co`
   - `https://splitsmart.vercel.app`
6. Add redirect URIs:
   - `https://[PROJECT-REF].supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret
8. In Supabase, go to **Authentication** → **Providers**
9. Enable **Google** and add your credentials

## ✅ Step 5: Production Testing

Test your deployed application thoroughly:

### 5.1 Authentication Testing
1. Visit your Vercel URL
2. Click **"Sign Up"** and create a test account
3. Check your email for confirmation (if enabled)
4. Sign in with your new account
5. Try signing out and back in

### 5.2 Core Functionality Testing
1. **Create a Group**: Add a test group with a few members
2. **Add Manual Expense**: Create an expense and split it
3. **Test Receipt Scanning**: Upload a receipt photo and verify AI extraction
4. **Check Balances**: Ensure calculations are correct
5. **Record Settlement**: Test payment recording
6. **Delete/Edit**: Try modifying expenses and groups

### 5.3 Mobile Testing
1. Open your site on a mobile device
2. Test all major functions
3. Verify responsive design works

## 🔧 Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set correctly
- Check database connection string format

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check Supabase project is running
- Ensure password in connection string is correct

**"OpenAI API errors"**
- Verify `OPENAI_API_KEY` is valid
- Check you have credits in your OpenAI account
- Test with a simple receipt image first

### Frontend Issues

**"Failed to fetch" errors**
- Verify `VITE_API_URL` points to your Render backend URL
- Check backend is deployed and responding
- Test backend health endpoint directly

**Authentication not working**
- Check Supabase Site URL matches your Vercel URL
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Clear browser cache and try again

**Build failures**
- Check Vercel build logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure environment variables are set

### CORS Issues

If you get CORS errors:
1. Verify backend is deployed successfully
2. Check frontend is using correct backend URL
3. Clear browser cache
4. The backend already has CORS enabled for all origins

## 📊 Monitoring & Logs

### Backend Logs (Render)
1. Go to Render dashboard
2. Click your service (`splitsmart-api`)
3. Click **"Logs"** tab
4. View real-time logs and errors

### Frontend Logs (Vercel)
1. Go to Vercel dashboard
2. Click your project (`splitsmart`)
3. Click on a deployment
4. View build and function logs

### Database Monitoring (Supabase)
1. Go to Supabase dashboard
2. Click **"Database"** → **"Logs"**
3. Monitor queries and performance

## 🔄 Updating Your App

Both platforms auto-deploy when you push to GitHub:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

- **Render** will automatically rebuild and redeploy your backend
- **Vercel** will automatically rebuild and redeploy your frontend

## 💰 Cost Breakdown

### Free Tier Limits
- **Render**: 750 hours/month (enough for 24/7), 0.1 CPU, 512MB RAM
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Supabase**: 500MB database, unlimited API requests
- **OpenAI**: Pay per use (~$0.01-0.02 per receipt scan)

### Estimated Monthly Cost
- **Backend**: $0 (free tier)
- **Frontend**: $0 (free tier)
- **Database**: $0 (free tier)
- **AI Receipt Scanning**: $1-5 depending on usage

**Total: $1-5/month** for moderate usage

Perfect for personal projects and small teams!

## 🚨 Important Notes

### Render Free Tier Limitations
- **Cold starts**: Free tier spins down after 15 minutes of inactivity
- **Wake-up time**: First request after sleep takes 30-60 seconds
- **Solution**: Upgrade to paid plan ($7/month) for always-on service

### Security Best Practices
- Never commit `.env` files to Git
- Use strong passwords for database
- Keep API keys secure
- Enable HTTPS (automatic on both platforms)
- Regularly update dependencies

### Performance Tips
- Optimize images before uploading receipts
- Use database indexes (already implemented)
- Monitor API response times
- Consider caching for frequently accessed data

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in Render and Vercel dashboards
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly: `https://your-backend.onrender.com/health`
4. **Check database connection** in Supabase dashboard
5. **Review browser console** for frontend errors

## 🎉 Success!

If you've followed this guide, your SplitSmart app should now be live on the web! 

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-api.onrender.com`

Share your app with friends and start splitting expenses! 💰

---

**Next Steps:**
- Add a custom domain to Vercel
- Set up monitoring and alerts
- Consider upgrading to paid tiers for better performance
- Add more features like recurring expenses or payment integrations

Good luck with your deployment! 🚀