// Review data types and normalization functions based on Hostaway API structure
export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface HostawayReview {
  id: number;
  type: "host-to-guest" | "guest-to-host";
  status: "published" | "pending" | "rejected";
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  channel?: string; // Added for normalization
}

export interface NormalizedReview extends HostawayReview {
  averageRating: number;
  channel: string;
  date: Date;
  isApproved?: boolean;
}

// Mock review data to combine with Hostaway API reviews
export const mockReviews: HostawayReview[] = [
  {
    id: 7453,
    type: "host-to-guest",
    status: "published",
    rating: null,
    publicReview:
      "Shane and family are wonderful! Would definitely host again :)",
    reviewCategory: [
      {
        category: "cleanliness",
        rating: 10,
      },
      {
        category: "communication",
        rating: 10,
      },
      {
        category: "respect_house_rules",
        rating: 10,
      },
    ],
    submittedAt: "2020-08-21 22:45:14",
    guestName: "Shane Finkelstein",
    listingName: "2B E1 - 33 St Clements",
    channel: "Hostaway",
  },
  {
    id: 7454,
    type: "guest-to-host",
    status: "published",
    rating: 4.5,
    publicReview:
      "Great location and clean apartment. The host was very responsive and helpful. Would recommend!",
    reviewCategory: [
      {
        category: "cleanliness",
        rating: 5,
      },
      {
        category: "communication",
        rating: 5,
      },
      {
        category: "location",
        rating: 4,
      },
      {
        category: "value",
        rating: 4,
      },
    ],
    submittedAt: "2025-01-15 10:30:00",
    guestName: "Sarah Johnson",
    listingName: "2B E1 - 33 St Clements",
    channel: "Hostaway",
  },
  {
    id: 7455,
    type: "guest-to-host",
    status: "published",
    rating: 5,
    publicReview:
      "Absolutely fantastic stay! The apartment was spotless and had everything we needed. Perfect location in the heart of London.",
    reviewCategory: [
      {
        category: "cleanliness",
        rating: 5,
      },
      {
        category: "communication",
        rating: 5,
      },
      {
        category: "location",
        rating: 5,
      },
      {
        category: "value",
        rating: 5,
      },
    ],
    submittedAt: "2025-02-20 14:15:00",
    guestName: "Michael Chen",
    listingName: "2B E1 A - 27 St Clements",
    channel: "Hostaway",
  },
  {
    id: 7456,
    type: "guest-to-host",
    status: "published",
    rating: 4,
    publicReview:
      "Nice place with good amenities. The check-in process was smooth. Only minor issue was the WiFi speed, but overall a good experience.",
    reviewCategory: [
      {
        category: "cleanliness",
        rating: 4,
      },
      {
        category: "communication",
        rating: 5,
      },
      {
        category: "location",
        rating: 4,
      },
      {
        category: "value",
        rating: 4,
      },
    ],
    submittedAt: "2025-03-10 09:00:00",
    guestName: "Emma Williams",
    listingName: "2B E1 A - 3 St Clements",
    channel: "Hostaway",
  },
  {
    id: 7457,
    type: "guest-to-host",
    status: "published",
    rating: 4.8,
    publicReview:
      "Excellent apartment in a great neighborhood. The host was very accommodating and the place was exactly as described.",
    reviewCategory: [
      {
        category: "cleanliness",
        rating: 5,
      },
      {
        category: "communication",
        rating: 5,
      },
      {
        category: "location",
        rating: 5,
      },
      {
        category: "value",
        rating: 4,
      },
    ],
    submittedAt: "2025-04-05 16:45:00",
    guestName: "David Brown",
    listingName: "2B E1 A - 3 St Clements",
    channel: "Hostaway",
  },
];

// Normalize review data
export function normalizeReview(review: HostawayReview): NormalizedReview {
  // Calculate average rating from categories or use direct rating
  let averageRating = 0;
  if (review.rating !== null) {
    averageRating = review.rating;
  } else if (review.reviewCategory && review.reviewCategory.length > 0) {
    const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
    averageRating = sum / review.reviewCategory.length;
  }

  // Parse date
  const date = new Date(review.submittedAt);

  // Determine channel (default to 'Hostaway' if not specified)
  const channel = review.channel || "Hostaway";

  return {
    ...review,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    channel,
    date,
  };
}
