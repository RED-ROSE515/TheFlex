import type { NextApiRequest, NextApiResponse } from "next";
import { normalizeReview, type NormalizedReview } from "@/lib/mockReviews";
import { fetchHostawayReviews } from "@/lib/hostawayApi";
import { fetchHostawayListings } from "@/lib/hostawayListings";
import { prisma } from "@/lib/db";
import { fetchGoogleReviews, normalizeGoogleReview } from "@/lib/googleReviews";

export interface ReviewsResponse {
  status: string;
  result: NormalizedReview[];
  total: number;
  listings: string[];
  channels: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewsResponse | { error: string; details?: any }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch reviews from Hostaway API
    const hostawayReviews = await fetchHostawayReviews();

    // Normalize all reviews
    const normalizedReviews = hostawayReviews.map(normalizeReview);

    // Get approval status from in-memory store
    const approvals = await prisma.reviewApproval.findMany();
    const approvalMap = new Map(approvals.map((a) => [a.reviewId, a.approved]));

    // Add approval status to reviews
    const reviewsWithApproval = normalizedReviews.map((review) => ({
      ...review,
      isApproved: approvalMap.get(review.id) ?? false,
    }));

    // Fetch listings from Hostaway API (not from reviews)
    const hostawayListings = await fetchHostawayListings();
    // Use internalListingName if available, otherwise use name
    const listings = hostawayListings
      .map((l) => l.internalListingName || l.name || l.externalListingName || '')
      .filter(name => name !== '')
      .sort();

    // Extract unique channels from reviews
    const channels = Array.from(
      new Set(normalizedReviews.map((r) => r.channel))
    ).sort();

    // Apply filters if provided
    let filteredReviews = reviewsWithApproval;
    const {
      listing,
      channel,
      type,
      status,
      minRating,
      maxRating,
      category,
      startDate,
      endDate,
    } = req.query;

    if (listing) {
      filteredReviews = filteredReviews.filter(
        (r) => r.listingName === listing
      );
    }

    if (channel) {
      filteredReviews = filteredReviews.filter((r) => r.channel === channel);
    }

    if (type) {
      filteredReviews = filteredReviews.filter((r) => r.type === type);
    }

    if (status) {
      filteredReviews = filteredReviews.filter((r) => r.status === status);
    }

    if (minRating) {
      const min = parseFloat(minRating as string);
      filteredReviews = filteredReviews.filter((r) => r.averageRating >= min);
    }

    if (maxRating) {
      const max = parseFloat(maxRating as string);
      filteredReviews = filteredReviews.filter((r) => r.averageRating <= max);
    }

    if (category) {
      filteredReviews = filteredReviews.filter((r) =>
        r.reviewCategory.some((cat) => cat.category === category)
      );
    }

    if (startDate) {
      const start = new Date(startDate as string);
      filteredReviews = filteredReviews.filter((r) => r.date >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999); // Include entire end date
      filteredReviews = filteredReviews.filter((r) => r.date <= end);
    }

    // Sort by date (newest first) by default
    filteredReviews.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Serialize dates to ISO strings for JSON response
    const serializedReviews = filteredReviews.map((review) => ({
      ...review,
      date: review.date.toISOString(),
    }));

    res.status(200).json({
      status: "success",
      result: serializedReviews as any,
      total: filteredReviews.length,
      listings,
      channels,
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    const errorMessage = error?.message || "Internal server error";
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({
      error: errorMessage,
      details: error?.response?.data || error?.stack,
    });
  }
}
