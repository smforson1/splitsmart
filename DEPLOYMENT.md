# Deployment Guide for SplitSmart

This guide will walk you through deploying SplitSmart to Vercel (both frontend and backend).

## Prerequisites

- GitHub account
- Supabase account (for database)
- OpenAI API key
- Vercel account (free tier is sufficient)

## Step 1: Database Setup (Supabase)

1. Go to https://supabase.com and create an account
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the contents of `backend/database_schema.sql`
5. Run the SQL to create all tables
6. Run the authentication migration: `backend/migrations/add_authentication.sql`
7. Go to Settings → Database
8. Copy the "Connection String" (URI format)
9. Go to Settings → API
10. Copy the "Project URL" and "anon/public" key
11. Save these for later - you'll need them for backend and frontend

## Step 2: Backend Deployment (Vercel)

1. Push your code to GitHub if you haven't already:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. Go to https://vercel.com and sign up/login
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository (`splitsmart`)
5. Configure the backend project:
   - **Project Name**: `splitsmart-api` (or your preferred name)
   - **Framework Preset**: Other
   - **Root Directory**: Click **"Edit"** and select `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

6. Add Environment Variables (click "Environment Variables"):
   - `DATABASE_URL`: Your Supabase connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: 3000
   - `NODE_ENV`: production

7. Click **"Deploy"**
8. Wait for deployment to complete (2-3 minutes)
9. Copy your backend URL (e.g., `https://splitsmart-api.vercel.app`)

### Test Backend

Visit: `https://your-backend-url.vercel.app/health`

You should see:
```json
{
  "status": "ok",
  "message": "SplitSmart API is running"
}
```

## Step 3: Frontend Deployment (Vercel)

1. Go back to Vercel Dashboard
2. Click **"Add New..."** → **"Project"**
3. Import the **same** GitHub repository (`splitsmart`)
4. Configure the frontend project:
   - **Project Name**: `splitsmart` (or your preferred name)
   - **Framework Preset**: Vite
   - **Root Directory**: Click **"Edit"** and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables (click "Environment Variables"):
   - `VITE_API_URL`: Your backend URL from Step 2 (e.g., `https://splitsmart-api.vercel.app`)
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

   **Important:** Make sure `VITE_API_URL` points to your backend URL from Step 2!

6. Click **"Deploy"**
7. Wait for deployment to complete (2-3 minutes)
8. Your app is now live at `https://splitsmart.vercel.app` (or your custom domain)!

## Step 4: Configure Authentication

### Enable Supabase Auth

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Optional: Disable "Confirm email" for easier testing
4. For Google OAuth, follow `GOOGLE_AUTH_SETUP.md`

### Update Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel frontend URL
3. Add to **Redirect URLs**: `https://your-frontend.vercel.app/**`

## Step 5: Testing Production

1. Visit your Vercel URL
2. Sign up for a new account (or sign in with Google)
3. Verify email if confirmation is enabled
4. Create a test group
5. Add members
6. Add an expense
7. Test receipt scanning
8. Verify balances calculate correctly
9. Test logout and login again

## Troubleshooting

### Backend Issues

**"Function execution timed out"**
- Vercel serverless functions have a 10-second timeout on free plan
- Check database connection speed
- Optimize slow queries
- Consider upgrading to Pro plan for 60-second timeout

**"Module not found" errors**
- Make sure all dependencies are in `package.json`
- Check that `node_modules` is in `.gitignore`
- Redeploy to trigger fresh install

**Database connection errors**
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooler settings
- Use the "Transaction" mode connection string
- Ensure SSL is enabled

### Frontend Issues

**"Failed to fetch" errors**
- Check that `VITE_API_URL` points to your backend URL
- Verify backend is deployed and running
- Check browser console for CORS errors
- Test backend `/health` endpoint

**Authentication not working**
- Verify Supabase URL and anon key are correct
- Check that Site URL is updated in Supabase
- Clear browser cache and try again
- Check browser console for errors

**Google OAuth redirect issues**
- Update Google OAuth authorized origins
- Update Supabase redirect URLs
- Check for typos in URLs

### CORS Issues

The backend already has CORS enabled. If you still get CORS errors:
- Verify backend is deployed successfully
- Check that frontend is using correct backend URL
- Clear browser cache
- Check for typos in environment variables

### Build Failures

**Backend build fails:**
- Check all dependencies are in `package.json`
- Verify `vercel.json` is in the backend folder
- Check Vercel build logs for specific errors

**Frontend build fails:**
- Check all dependencies are in `package.json`
- Verify environment variables are set
- Check Vercel build logs for specific errors

## Environment Variables Summary

### Backend Environment Variables (Vercel)
```
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-...
PORT=3000
NODE_ENV=production
```

### Frontend Environment Variables (Vercel)
```
VITE_API_URL=https://splitsmart-api.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** Replace URLs with your actual deployment URLs!

## Monitoring

### Backend Logs (Vercel)
1. Go to Vercel dashboard
2. Click on your backend project (`splitsmart-api`)
3. Click on a deployment
4. Click **"Functions"** tab
5. View real-time logs and function executions

### Frontend Logs (Vercel)
1. Go to Vercel dashboard
2. Click on your frontend project (`splitsmart`)
3. Click on a deployment
4. View build logs and runtime logs

## Updating the App

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Both backend and frontend will automatically redeploy!

### Preview Deployments

- **Push to `main` branch** → Deploys to production
- **Push to other branches** → Creates preview deployments
- **Pull requests** → Creates preview deployments with unique URLs

## Cost Considerations

### Vercel Free Tier Includes
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Serverless function execution (100GB-hours)
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Custom domains
- ✅ Analytics

### Free Tier Limits
- **Supabase**: 500MB database, unlimited API requests
- **Vercel**: 100GB bandwidth, serverless functions
- **OpenAI**: Pay per use (~$0.01 per receipt scan)

### Estimated Monthly Cost
- Database: $0 (free tier)
- Backend: $0 (free tier)
- Frontend: $0 (free tier)
- OpenAI: ~$1-5 depending on usage

**Total: $1-5/month** for moderate usage

Perfect for personal projects and small teams!

## Security Best Practices

1. Never commit `.env` files
2. Use environment variables for all secrets
3. Enable SSL/HTTPS (automatic on Vercel/Render)
4. Validate all user inputs on backend
5. Use prepared statements for SQL queries (we do this with pg)
6. Rate limit API endpoints in production
7. Keep dependencies updated

## Performance Optimization

1. Enable database connection pooling
2. Add indexes to frequently queried columns (already done)
3. Implement caching for balance calculations
4. Compress images before uploading
5. Use CDN for static assets

## Backup Strategy

1. Supabase automatically backs up your database
2. Keep your code in GitHub (version control)
3. Export important data periodically
4. Document your schema and migrations

## Custom Domains (Optional)

### Add Custom Domain to Frontend

1. Go to your frontend project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (e.g., `splitsmart.com`)
4. Follow DNS configuration instructions
5. Update Supabase Site URL to your custom domain
6. Update Google OAuth authorized origins

### Add Custom Domain to Backend

1. Go to your backend project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your API subdomain (e.g., `api.splitsmart.com`)
4. Update frontend `VITE_API_URL` environment variable
5. Redeploy frontend

## Why Vercel for Backend?

✅ **Same platform** - Manage both frontend and backend in one place
✅ **Automatic deployments** - Push to GitHub and both deploy
✅ **Serverless** - Auto-scales, no server management
✅ **Free tier** - Generous limits for small projects
✅ **Fast** - Edge network for low latency
✅ **Easy setup** - No complex configuration needed

## Support

If you encounter issues:
1. Check the logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Test API endpoints: `https://your-backend.vercel.app/health`
4. Check database connection in Supabase dashboard
5. Review browser console for frontend errors

Good luck with your deployment! 🚀
