# Deployment Guide for SplitSmart

This guide will walk you through deploying SplitSmart to production.

## Prerequisites

- GitHub account
- Supabase account (for database)
- OpenAI API key
- Vercel account (for frontend)
- Render account (for backend)

## Step 1: Database Setup (Supabase)

1. Go to https://supabase.com and create an account
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the contents of `backend/database_schema.sql`
5. Run the SQL to create all tables
6. Go to Settings → Database
7. Copy the "Connection String" (URI format)
8. Save this for later - you'll need it for the backend

## Step 2: Backend Deployment (Render)

1. Push your code to GitHub if you haven't already:
```bash
git remote add origin https://github.com/yourusername/splitsmart.git
git push -u origin main
```

2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: splitsmart-api
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: 3000

7. Click "Create Web Service"
8. Wait for deployment to complete
9. Copy your backend URL (e.g., https://splitsmart-api.onrender.com)

## Step 3: Frontend Deployment (Vercel)

1. Go to https://vercel.com and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (from Step 2)

6. Click "Deploy"
7. Wait for deployment to complete
8. Your app is now live!

## Step 4: Testing Production

1. Visit your Vercel URL
2. Create a test group
3. Add members
4. Add an expense
5. Test receipt scanning
6. Verify balances calculate correctly

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
OPENAI_API_KEY=sk-...
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
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
