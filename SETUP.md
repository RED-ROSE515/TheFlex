# Setup Instructions

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Initialize Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Detailed Setup

### Step 1: Install Node.js

Ensure you have Node.js 18 or higher installed:

```bash
node --version
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:

- Next.js and React
- TypeScript
- Tailwind CSS
- Prisma ORM
- Other required dependencies

### Step 3: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database and tables
npx prisma db push
```

This creates a SQLite database file at `prisma/dev.db`.

**Important**: You must run `npx prisma db push` before starting the application, otherwise you'll get a "table does not exist" error.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Accessing the Application

### Home Page

- URL: `http://localhost:3000`
- Contains links to Dashboard and Property pages

### Manager Dashboard

- URL: `http://localhost:3000/dashboard`
- View, filter, and manage reviews
- Approve reviews for public display

### Property Pages

- URL: `http://localhost:3000/property/[property-slug]`
- Example: `http://localhost:3000/property/2B-N1-A-29-Shoreditch-Heights`
- Displays property details and approved reviews

## Testing the API

### Get All Reviews

```bash
curl http://localhost:3000/api/reviews/hostaway
```

### Filter Reviews

```bash
# By listing
curl "http://localhost:3000/api/reviews/hostaway?listing=2B%20N1%20A%20-%2029%20Shoreditch%20Heights"

# By rating
curl "http://localhost:3000/api/reviews/hostaway?minRating=4"

# By channel
curl "http://localhost:3000/api/reviews/hostaway?channel=Airbnb"
```

### Approve a Review

```bash
curl -X POST http://localhost:3000/api/reviews/approve \
  -H "Content-Type: application/json" \
  -d '{"reviewId": 7453, "listingName": "2B N1 A - 29 Shoreditch Heights", "approved": true}'
```

### Get Public Reviews

```bash
curl http://localhost:3000/api/reviews/public
```

## Viewing the Database

Use Prisma Studio to view and edit the database:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555`.

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Windows PowerShell
$env:PORT=3001; npm run dev

# Or modify package.json to use a different port
```

### Database Errors

If you encounter database errors:

```bash
# Reset the database
npx prisma db push --force-reset
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart the dev server
```

### Module Not Found

If you see module not found errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Build

To build for production:

```bash
npm run build
npm start
```

## Environment Variables

Currently, no environment variables are required. For production, you may want to set:

```env
DATABASE_URL=file:./prisma/prod.db
NODE_ENV=production
```

## Next Steps

1. Explore the dashboard at `/dashboard`
2. Approve some reviews
3. View them on property pages
4. Test the API endpoints
5. Review the documentation in `DOCUMENTATION.md`

## Support

For issues or questions, refer to:

- `README.md` - Project overview
- `DOCUMENTATION.md` - Technical details
- `lib/googleReviews.ts` - Google Reviews integration research
