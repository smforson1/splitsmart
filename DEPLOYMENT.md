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

### CORS Errors
If you get CORS errors, make sure your backend `server.js` has:
```javascript
app.use(cors());
```

For production, you can restrict to your frontend domain:
```javascript
app.use(cors({
  origin: 'https://your-frontend.vercel.app'
}));
```

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Make sure SSL is enabled in the connection string
- Check Supabase project is active

### OpenAI API Errors
- Verify your API key is correct
- Check you have credits remaining
- Ensure the model name is correct (`gpt-4o`)

### Build Failures
- Check all dependencies are in package.json
- Verify Node.js version compatibility
- Check build logs for specific errors

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-...
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Monitoring

### Backend Logs
- Go to Render dashboard
- Click on your service
- View "Logs" tab

### Frontend Logs
- Go to Vercel dashboard
- Click on your project
- View "Deployments" → Click deployment → "Functions" tab

## Updating the App

### Backend Updates
```bash
git add .
git commit -m "Update backend"
git push
```
Render will automatically redeploy.

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel will automatically redeploy.

## Cost Considerations

### Free Tier Limits
- **Supabase**: 500MB database, unlimited API requests
- **Render**: 750 hours/month (enough for 1 service)
- **Vercel**: Unlimited deployments, 100GB bandwidth
- **OpenAI**: Pay per use (~$0.01 per receipt scan)

### Estimated Monthly Cost
- Database: $0 (free tier)
- Backend: $0 (free tier)
- Frontend: $0 (free tier)
- OpenAI: ~$1-5 depending on usage

**Total: $1-5/month** for moderate usage

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

## Support

If you encounter issues:
1. Check the logs (Render/Vercel dashboards)
2. Verify environment variables are set correctly
3. Test API endpoints with Postman/Thunder Client
4. Check database connection with Supabase dashboard

Good luck with your deployment! 🚀
