# Flex Living Reviews Dashboard - Technical Documentation

## Overview

This document provides detailed technical information about the Flex Living Reviews Dashboard implementation, including architecture decisions, API behaviors, and integration details.

## Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router for server-side rendering and API routes
- **TypeScript**: Type safety and improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Hooks**: State management and side effects
- **Axios**: HTTP client for API requests
- **date-fns**: Date manipulation and formatting
- **Lucide React**: Icon library

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access
- **SQLite**: Lightweight database for development and production

## Architecture

### Application Structure

The application follows Next.js 14 App Router conventions:

```
app/
  ├── dashboard/          # Manager dashboard (client component)
  ├── property/[slug]/    # Dynamic property pages (client component)
  └── page.tsx            # Home page (server component)

pages/
  └── api/
      └── reviews/        # API endpoints (serverless functions)
```

### Data Flow

1. **Review Data Source**: Mock data in `lib/mockReviews.ts` simulates Hostaway API
2. **API Normalization**: `/api/reviews/hostaway` normalizes and filters reviews
3. **Database Storage**: Review approvals stored in SQLite via Prisma
4. **Frontend Display**: React components fetch and display data

## API Behaviors

### GET `/api/reviews/hostaway`

**Purpose**: Fetch and normalize reviews from Hostaway (currently mocked)

**Normalization Logic**:

1. Calculates average rating from category ratings if direct rating unavailable
2. Parses date strings to Date objects
3. Assigns channel (defaults to 'Hostaway' if not specified)
4. Adds approval status from database
5. Applies filters based on query parameters
6. Sorts by date (newest first) by default

**Filtering**:

- Supports multiple simultaneous filters
- Filters are applied in sequence (AND logic)
- Date filters use inclusive ranges
- Rating filters support decimal values

**Response Structure**:

```typescript
{
  status: "success",
  result: NormalizedReview[],
  total: number,
  listings: string[],
  channels: string[]
}
```

**Error Handling**:

- Returns 500 status with error message on failure
- Logs errors to console for debugging

### POST `/api/reviews/approve`

**Purpose**: Approve or unapprove reviews for public display

**Validation**:

- Requires `reviewId` (number) and `approved` (boolean)
- Uses upsert to create or update approval record

**Database Operation**:

- Uses Prisma `upsert` to handle both new and existing approvals
- Updates `listingName` if provided
- Automatically sets timestamps

### GET `/api/reviews/public`

**Purpose**: Fetch approved reviews for public property pages

**Filtering**:

- Only returns reviews with `approved: true` and `status: 'published'`
- Optionally filters by `listingName` query parameter
- Sorted by date (newest first)

**Security Consideration**:

- This endpoint is public-facing
- Only returns approved reviews
- No sensitive data exposed

## Database Schema

### ReviewApproval Model

```prisma
model ReviewApproval {
  id         Int      @id @default(autoincrement())
  reviewId   Int      @unique
  listingName String
  approved   Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Design Decisions**:

- `reviewId` is unique to prevent duplicates
- `listingName` stored for quick filtering
- Timestamps track when approvals were made/updated

## Review Normalization

### Input Format (Hostaway)

```typescript
{
  id: number,
  type: 'host-to-guest' | 'guest-to-host',
  status: 'published' | 'pending' | 'rejected',
  rating: number | null,
  publicReview: string,
  reviewCategory: Array<{category: string, rating: number}>,
  submittedAt: string, // ISO date string
  guestName: string,
  listingName: string,
  channel?: string
}
```

### Output Format (Normalized)

```typescript
{
  ...HostawayReview,
  averageRating: number,  // Calculated from categories or direct rating
  channel: string,         // Defaults to 'Hostaway' if not provided
  date: Date,             // Parsed from submittedAt
  isApproved?: boolean     // From database
}
```

### Rating Calculation

1. If `rating` is provided directly, use it
2. Otherwise, calculate average from `reviewCategory` ratings
3. Round to 1 decimal place for consistency

## Dashboard Features

### Statistics Calculation

- **Total Reviews**: Count of filtered reviews
- **Average Rating**: Mean of all `averageRating` values
- **Approved Count**: Reviews with `isApproved: true`
- **Pending Count**: Reviews with `status: 'pending'`

### Trending Issues Detection

Algorithm:

1. Aggregate all category ratings across filtered reviews
2. Calculate average rating per category
3. Sort by average (lowest first)
4. Return top 3 categories needing improvement

### Filtering & Sorting

**Client-Side Filtering**:

- Filters applied in React state
- Instant updates without API calls
- Preserves filter state during navigation

**Sort Options**:

- Date: Chronological order
- Rating: By average rating
- Listing: Alphabetical by listing name

**Sort Order**:

- Ascending or descending
- Default: Date descending (newest first)

## Property Page Implementation

### Dynamic Routing

- Uses Next.js dynamic routes: `/property/[slug]`
- Slug format: `2B-N1-A-29-Shoreditch-Heights`
- Converts slug to listing name for API filtering

### Property Data

Currently uses mock property data. In production:

- Should fetch from property management system
- Could integrate with Hostaway listings API
- Should cache property data for performance

### Review Display

- Only shows approved reviews
- Displays average rating summary
- Shows review count
- Responsive grid layout

## Google Reviews Integration

### Implementation Status: ✅ Basic Integration Complete

**Feasibility**: ✅ Implemented with Google Places API

### Implementation Details

**Files Created/Updated**:

- `lib/googleReviews.ts` - Google Places API integration functions
- `pages/api/reviews/google.ts` - API endpoint for fetching Google Reviews
- Updated `pages/api/reviews/hostaway.ts` - Ready for Google Reviews integration

**Features Implemented**:

1. ✅ Google Places API integration using Legacy API (stable and well-documented)
2. ✅ 24-hour in-memory caching to reduce API calls
3. ✅ Review normalization to match Hostaway format
4. ✅ Place ID lookup by address/name
5. ✅ Error handling and fallback mechanisms
6. ✅ Auto-approval of Google Reviews (can be overridden in dashboard)

**API Endpoint**: `GET /api/reviews/google`

**Query Parameters**:

- `placeId` (required if address not provided) - Google Place ID
- `address` (required if placeId not provided) - Property address
- `listingName` (optional) - Property name for better Place ID lookup

**Example Request**:

```
GET /api/reviews/google?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4
GET /api/reviews/google?address=1 Porter St, London SE1 9HD&listingName=The Bromley Collection
```

**Response Format**:

```json
{
  "status": "success",
  "result": [
    {
      "id": 1234567890,
      "type": "guest-to-host",
      "status": "published",
      "rating": 5,
      "publicReview": "Great property!",
      "reviewCategory": [],
      "submittedAt": "2025-01-15 10:30:00",
      "guestName": "John Doe",
      "listingName": "Property Name",
      "channel": "Google",
      "averageRating": 5,
      "date": "2025-01-15T10:30:00.000Z",
      "isApproved": true
    }
  ],
  "total": 1
}
```

### Setup Instructions

1. **Get Google Places API Key**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Places API"
   - Create API key
   - (Recommended) Restrict API key to your domain/IP

2. **Add to Environment Variables**:

   ```env
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. **Get Place ID for Properties**:
   - Use Google Maps to find your property
   - Right-click and select "What's here?"
   - Copy the Place ID from the URL or use the API
   - Store Place ID in your listings database (future enhancement)

### Current Limitations

1. **Place ID Storage**: Currently requires manual Place ID lookup. Future enhancement: Store in database
2. **Caching**: Uses in-memory cache (resets on server restart). Future: Use Redis or database cache
3. **Rate Limiting**: No built-in rate limiting. Google's quota applies
4. **Review Moderation**: Google reviews are auto-approved. Can be manually unapproved in dashboard

### Cost Estimation

- **Places API (Legacy)**: $32 per 1,000 requests
- **Place Details Request**: ~$17 per 1,000 requests
- **With 10 properties, fetching reviews daily**: ~300 requests/month
- **Estimated cost**: ~$5-10/month

### Integration with Existing System

Google Reviews are normalized to match Hostaway review format:

- Appear in dashboard with "Google" channel
- Can be filtered by channel
- Can be approved/unapproved (though auto-approved by default)
- Displayed on property pages when approved

### Future Enhancements

1. Store Place IDs in database (add to listings table)
2. Automatic Place ID lookup on listing creation
3. Persistent caching (Redis or database)
4. Batch fetching for multiple properties
5. Review sync scheduling (daily/hourly)
6. Google Reviews widget embed option

### Security Considerations

✅ **Implemented**:

- API key stored in environment variables (never exposed to frontend)
- Backend API route proxies all Google API calls
- Error handling prevents API key exposure

⚠️ **Recommended**:

- Restrict API key to specific domains/IPs in Google Cloud Console
- Implement rate limiting on backend
- Monitor API usage to prevent unexpected costs

## Security Considerations

### API Key Management

- Never expose API keys in frontend code
- Use environment variables for sensitive data
- Restrict API keys to specific domains/IPs

### Database Security

- SQLite suitable for development
- For production, consider PostgreSQL with connection pooling
- Implement proper authentication for dashboard access

### Input Validation

- All API endpoints validate input types
- SQL injection prevented by Prisma ORM
- XSS protection via React's built-in escaping

## Performance Optimizations

### Caching Strategy

- Consider implementing Redis for API response caching
- Cache Google Reviews API responses for 24 hours
- Cache property data to reduce database queries

### Database Indexing

- `reviewId` is unique (indexed automatically)
- Consider adding index on `listingName` for faster filtering
- Index `approved` field for public reviews query

### Frontend Optimization

- Client-side filtering reduces API calls
- Lazy loading for review cards
- Image optimization for property photos

## Error Handling

### API Errors

- All endpoints return appropriate HTTP status codes
- Error messages logged to console
- User-friendly error messages in UI

### Database Errors

- Prisma handles connection errors
- Graceful degradation if database unavailable
- Error boundaries in React components

## Testing Recommendations

### Unit Tests

- Review normalization function
- Filter logic
- Statistics calculations
- Date parsing

### Integration Tests

- API endpoint responses
- Database operations
- Review approval workflow

### E2E Tests

- Dashboard filtering
- Review approval process
- Property page review display

## Deployment Considerations

### Environment Variables

```
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_API_URL=http://localhost:3000
GOOGLE_PLACES_API_KEY=your_key_here (if implementing)
```

### Database Migration

- Run `npx prisma migrate deploy` in production
- Ensure database file is writable
- Consider PostgreSQL for production scalability

### Build Process

- `npm run build` creates optimized production build
- Static pages pre-rendered at build time
- API routes remain serverless

## Future Enhancements

1. **Real Hostaway Integration**: Replace mock data with actual API calls
2. **Authentication**: Add user authentication for dashboard
3. **Review Responses**: Allow hosts to respond to reviews
4. **Email Notifications**: Alert managers of new reviews
5. **Analytics Dashboard**: Advanced reporting and insights
6. **Export Functionality**: CSV/PDF export of reviews
7. **Multi-language Support**: Internationalization
8. **Review Request Automation**: Automated emails to guests

## Conclusion

The Flex Living Reviews Dashboard provides a solid foundation for managing guest reviews. The architecture is scalable, the code is maintainable, and the UI is intuitive. The mock implementation demonstrates the full workflow while being ready for real API integration.
