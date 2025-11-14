# Flex Living - Reviews Dashboard

A comprehensive reviews management system for Flex Living properties, featuring a manager dashboard and public-facing property pages with guest reviews.

## Features

### Manager Dashboard

- **Review Management**: View, filter, and manage all guest reviews
- **Performance Analytics**: See per-property performance metrics
- **Advanced Filtering**: Filter by listing, channel, type, status, rating, and date
- **Trend Analysis**: Identify areas for improvement based on category ratings
- **Review Approval**: Select which reviews should be displayed publicly
- **Real-time Statistics**: Total reviews, average rating, approved count, and pending reviews

### Property Pages

- **Property Details**: Beautiful property listing pages with images and amenities
- **Public Reviews**: Display only approved reviews from the dashboard
- **Rating Summary**: Average rating and review count
- **Responsive Design**: Mobile-friendly layout

### API Integration

- **Hostaway API**: Real-time integration with OAuth authentication
- **Review Normalization**: Consistent data structure across all channels
- **Database Persistence**: SQLite database for storing review approvals
- **Token Management**: Automatic token refresh with localStorage (client) and memory cache (server)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Hostaway API credentials (Account ID and API Key)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flex-living-reviews-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your Hostaway credentials
# HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
# HOSTAWAY_ACCOUNT_ID=your_account_id
# HOSTAWAY_API_KEY=your_api_key
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/          # Manager dashboard page
│   ├── property/[slug]/   # Property details pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   └── ReviewCard.tsx     # Review display component
├── lib/
│   ├── db.ts              # Prisma client
│   ├── mockReviews.ts     # Mock review data and normalization
│   └── googleReviews.ts   # Google Reviews integration research
├── pages/
│   └── api/
│       └── reviews/
│           ├── hostaway.ts  # Hostaway reviews API endpoint
│           ├── approve.ts   # Review approval endpoint
│           └── public.ts   # Public reviews endpoint
├── prisma/
│   └── schema.prisma      # Database schema
└── README.md
```

## API Endpoints

### GET `/api/reviews/hostaway`

Fetches and normalizes reviews from Hostaway (mocked).

**Query Parameters:**

- `listing` - Filter by listing name
- `channel` - Filter by channel (Airbnb, Booking.com, etc.)
- `type` - Filter by type (guest-to-host, host-to-guest)
- `status` - Filter by status (published, pending, rejected)
- `minRating` - Minimum rating (0-5)
- `maxRating` - Maximum rating (0-5)
- `category` - Filter by category (cleanliness, communication, etc.)
- `startDate` - Start date filter (ISO format)
- `endDate` - End date filter (ISO format)

**Response:**

```json
{
  "status": "success",
  "result": [...],
  "total": 10,
  "listings": [...],
  "channels": [...]
}
```

### POST `/api/reviews/approve`

Approves or unapproves a review for public display.

**Body:**

```json
{
  "reviewId": 7453,
  "listingName": "2B N1 A - 29 Shoreditch Heights",
  "approved": true
}
```

### GET `/api/reviews/public`

Fetches approved reviews for public display.

**Query Parameters:**

- `listingName` - Filter by listing name (optional)

**Response:**

```json
{
  "reviews": [...]
}
```

## Database Schema

The application uses SQLite with Prisma. The schema includes:

- **ReviewApproval**: Stores which reviews are approved for public display
  - `id`: Primary key
  - `reviewId`: Unique review ID from Hostaway
  - `listingName`: Property listing name
  - `approved`: Boolean approval status
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

## Design Decisions

### Review Normalization

- All reviews are normalized to a consistent structure regardless of source
- Average rating calculated from category ratings when direct rating unavailable
- Channel information preserved for filtering
- Date parsing handles various formats

### Dashboard Features

- **Trending Issues**: Automatically identifies lowest-rated categories across all reviews
- **Real-time Filtering**: Filters apply instantly without page reload
- **Approval Workflow**: Simple toggle to approve/unapprove reviews
- **Performance Metrics**: Quick overview of review statistics

### UI/UX

- Clean, modern design with Tailwind CSS
- Responsive layout for mobile and desktop
- Intuitive filtering and sorting
- Visual indicators for review status and approval state
- Star ratings for easy visual assessment

## Google Reviews Integration

See `lib/googleReviews.ts` for detailed research on Google Reviews integration. Key findings:

- **Feasible**: Google Places API can be integrated
- **Requirements**: Google Cloud account, API key, Place IDs for each property
- **Challenges**: Rate limiting, cost considerations, data structure differences
- **Recommendation**: Implement as Phase 2 after Hostaway integration is stable

## Development

### Running in Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Database Migrations

```bash
npx prisma migrate dev
```

### Viewing Database

```bash
npx prisma studio
```

## Testing the API

The Hostaway API endpoint can be tested directly:

```bash
# Get all reviews
curl http://localhost:3000/api/reviews/hostaway

# Filter by listing
curl "http://localhost:3000/api/reviews/hostaway?listing=2B%20N1%20A%20-%2029%20Shoreditch%20Heights"

# Filter by rating
curl "http://localhost:3000/api/reviews/hostaway?minRating=4"
```

## Future Enhancements

- [ ] Real Hostaway API integration (replace mock data)
- [ ] Google Reviews integration
- [ ] Email notifications for new reviews
- [ ] Review response functionality
- [ ] Export reviews to CSV/PDF
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Review moderation workflow
- [ ] Automated review request emails

## License

This project is created for the Flex Living developer assessment.

## Contact

For questions or issues, please contact the development team.
