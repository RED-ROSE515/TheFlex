# Vercel Deployment Guide

## ✅ Prisma Removed

Prisma has been removed from the project to simplify Vercel deployment. The application now uses an **in-memory store** for review approvals.

## How It Works

The application uses an in-memory Map to store review approvals. This means:
- ✅ **No database setup required** - works out of the box on Vercel
- ✅ **No migrations or schema management**
- ✅ **Simple deployment** - just push to Vercel
- ⚠️ **Approvals reset on each deployment** - data is not persisted across server restarts

## Deployment Steps

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables (Optional):**
   - `HOSTAWAY_BASE_URL` - Default: `https://api.hostaway.com/v1`
   - `HOSTAWAY_ACCOUNT_ID` - Your Hostaway account ID
   - `HOSTAWAY_API_KEY` - Your Hostaway API key
   - `GOOGLE_PLACES_API_KEY` - For Google Reviews integration

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

That's it! No database configuration needed.

## Important Notes

### In-Memory Store Limitations

- Review approvals are stored in memory and **reset on each deployment**
- Approvals persist during the server's lifetime but are lost on:
  - Server restart
  - New deployment
  - Serverless function cold start (in some cases)

### For Persistent Storage (Optional)

If you need persistent review approvals, you can:

1. **Use Vercel KV (Redis):**
   ```bash
   npm install @vercel/kv
   ```
   Then update `lib/db.ts` to use Vercel KV instead of the in-memory Map.

2. **Use Upstash Redis:**
   ```bash
   npm install @upstash/redis
   ```
   Similar to Vercel KV, but works with any hosting provider.

3. **Use a simple JSON file API:**
   Store approvals in a JSON file on a service like GitHub Gist or a simple file storage API.

## Build Settings

Vercel automatically detects Next.js. The build command is:
```bash
npm run build
```

No special configuration needed!

## Troubleshooting

### Build Errors

- Ensure all dependencies are in `package.json`
- Check that Node.js version is 18+ (Vercel default)
- Review build logs in Vercel dashboard

### Runtime Errors

- Check function logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure API endpoints are accessible

### Review Approvals Not Persisting

This is expected behavior with the in-memory store. Approvals reset on each deployment. For persistence, see "For Persistent Storage" section above.

## Environment Variables

Add these in your Vercel project settings (Settings → Environment Variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `HOSTAWAY_BASE_URL` | No | Hostaway API base URL (default: `https://api.hostaway.com/v1`) |
| `HOSTAWAY_ACCOUNT_ID` | No | Your Hostaway account ID |
| `HOSTAWAY_API_KEY` | No | Your Hostaway API key |
| `GOOGLE_PLACES_API_KEY` | No | Google Places API key for reviews |

## Post-Deployment

After deploying:
1. ✅ Test the dashboard at `/dashboard`
2. ✅ Test review approval functionality
3. ✅ Verify public review pages work at `/property/[slug]`
4. ✅ Check Vercel function logs for any errors

## Support

For issues or questions:
- Check Vercel deployment logs
- Review `README.md` for project overview
- See `DOCUMENTATION.md` for technical details
