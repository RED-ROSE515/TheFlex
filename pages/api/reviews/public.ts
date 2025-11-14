import type { NextApiRequest, NextApiResponse } from "next";
import { normalizeReview, type NormalizedReview, type HostawayReview } from "@/lib/mockReviews";
import { fetchHostawayReviews } from "@/lib/hostawayApi";
import { prisma } from "@/lib/db";

// Helper function to format date as "YYYY-MM-DD HH:mm:ss"
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Mock reviews for "The Putney Apart" listing
const getMockReviewsForPutney = (): HostawayReview[] => {
  return [
    {
      id: 10001,
      type: "guest-to-host",
      status: "published",
      rating: 5,
      publicReview: "Absolutely fantastic stay! The Putney Apart was spotless, beautifully furnished, and in a perfect location. The host was incredibly responsive and helpful throughout our stay. Would definitely book again!",
      reviewCategory: [
        { category: "cleanliness", rating: 5 },
        { category: "communication", rating: 5 },
        { category: "location", rating: 5 },
        { category: "value", rating: 5 },
      ],
      submittedAt: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
      guestName: "Sarah Mitchell",
      listingName: "The Putney Apart",
      channel: "Hostaway",
    },
    {
      id: 10002,
      type: "guest-to-host",
      status: "published",
      rating: 4.8,
      publicReview: "Wonderful apartment with great amenities. The location is perfect - close to transport and local shops. The apartment was very clean and well-maintained. Highly recommend!",
      reviewCategory: [
        { category: "cleanliness", rating: 5 },
        { category: "communication", rating: 5 },
        { category: "location", rating: 5 },
        { category: "value", rating: 4 },
      ],
      submittedAt: formatDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
      guestName: "James Anderson",
      listingName: "The Putney Apart",
      channel: "Hostaway",
    },
    {
      id: 10003,
      type: "guest-to-host",
      status: "published",
      rating: 4.5,
      publicReview: "Great stay at The Putney Apart! The apartment is modern and comfortable. The check-in process was smooth and the host provided excellent communication. The area is lovely with plenty of restaurants nearby.",
      reviewCategory: [
        { category: "cleanliness", rating: 4 },
        { category: "communication", rating: 5 },
        { category: "location", rating: 5 },
        { category: "value", rating: 4 },
      ],
      submittedAt: formatDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
      guestName: "Emily Thompson",
      listingName: "The Putney Apart",
      channel: "Hostaway",
    },
    {
      id: 10004,
      type: "guest-to-host",
      status: "published",
      rating: 5,
      publicReview: "Perfect apartment for our stay in London! The Putney Apart exceeded our expectations. Everything was clean, well-organized, and the host was very accommodating. The location is excellent with easy access to central London.",
      reviewCategory: [
        { category: "cleanliness", rating: 5 },
        { category: "communication", rating: 5 },
        { category: "location", rating: 5 },
        { category: "value", rating: 5 },
      ],
      submittedAt: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      guestName: "Robert Martinez",
      listingName: "The Putney Apart",
      channel: "Hostaway",
    },
    {
      id: 10005,
      type: "guest-to-host",
      status: "published",
      rating: 4.7,
      publicReview: "Lovely apartment with a great view! The Putney Apart is well-equipped and comfortable. The host was very helpful and responsive. The neighborhood is quiet and safe. Would stay here again!",
      reviewCategory: [
        { category: "cleanliness", rating: 5 },
        { category: "communication", rating: 5 },
        { category: "location", rating: 4 },
        { category: "value", rating: 5 },
      ],
      submittedAt: formatDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
      guestName: "Lisa Chen",
      listingName: "The Putney Apart",
      channel: "Hostaway",
    },
  ];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ reviews: NormalizedReview[] } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { listingName } = req.query;

    // If listingName is provided and matches "The Putney Apart", return mock data
    if (listingName) {
      const searchName = decodeURIComponent(listingName as string).toLowerCase().trim();
      const normalizedSearch = searchName.replace(/[-\s]+/g, ' ');
      
      // Check if it matches "The Putney Apart" (with various possible formats)
      if (
        searchName.includes("putney") || 
        normalizedSearch.includes("putney apart")
      ) {
        const mockReviews = getMockReviewsForPutney();
        const normalizedMockReviews = mockReviews.map(normalizeReview);
        
        // Sort by date (newest first)
        normalizedMockReviews.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Serialize dates to ISO strings for JSON response
        const serializedReviews = normalizedMockReviews.map((review) => ({
          ...review,
          date: review.date.toISOString(),
        }));
        
        return res.status(200).json({ reviews: serializedReviews as any });
      }
    }

    // Fetch reviews from Hostaway API
    const hostawayReviews = await fetchHostawayReviews();

    // Get all approved reviews from in-memory store
    const approvals = await prisma.reviewApproval.findMany({
      where: { approved: true },
    });
    const approvedIds = new Set(approvals.map((a) => a.reviewId));

    // Normalize and filter reviews - only return approved and published reviews
    let normalizedReviews = hostawayReviews
      .map(normalizeReview)
      .filter((review) => {
        // If there are any approvals stored, only return approved reviews
        // Otherwise, return all published reviews (for initial state)
        if (approvals.length > 0) {
          return approvedIds.has(review.id) && review.status === "published";
        }
        return review.status === "published";
      });

    // Filter by listing if provided
    // Try to match by exact name, internalListingName, or externalListingName
    if (listingName) {
      const searchName = decodeURIComponent(listingName as string).toLowerCase().trim();
      normalizedReviews = normalizedReviews.filter((r) => {
        const reviewListingName = r.listingName.toLowerCase().trim();
        
        // Exact match
        if (reviewListingName === searchName) {
          return true;
        }
        
        // Try matching with normalized spaces/hyphens
        const normalizedReview = reviewListingName.replace(/[-\s]+/g, ' ');
        const normalizedSearch = searchName.replace(/[-\s]+/g, ' ');
        if (normalizedReview === normalizedSearch) {
          return true;
        }
        
        // Partial match
        if (reviewListingName.includes(searchName) || searchName.includes(reviewListingName)) {
          return true;
        }
        
        return false;
      });
    }

    // Sort by date (newest first)
    normalizedReviews.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Serialize dates to ISO strings for JSON response
    const serializedReviews = normalizedReviews.map((review) => ({
      ...review,
      date: review.date.toISOString(),
    }));

    res.status(200).json({ reviews: serializedReviews as any });
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
