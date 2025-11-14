import type { NextApiRequest, NextApiResponse } from "next";
import {
  fetchGoogleReviews,
  normalizeGoogleReview,
  findPlaceId,
} from "@/lib/googleReviews";
import { prisma } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | { status: string; result: any[]; total: number }
    | { error: string; details?: any }
  >
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { placeId, listingName, address } = req.query;

    if (!placeId && !address) {
      return res.status(400).json({
        error: "Either placeId or address must be provided",
      });
    }

    let finalPlaceId: string | null = (placeId as string) || null;

    // If address is provided but no placeId, try to find it
    if (!finalPlaceId && address) {
      finalPlaceId = await findPlaceId(
        address as string,
        listingName as string | undefined
      );

      if (!finalPlaceId) {
        return res.status(404).json({
          error: "Could not find Google Place ID for the provided address",
        });
      }
    }

    // At this point, finalPlaceId must be a string
    if (!finalPlaceId) {
      return res.status(400).json({
        error: "Place ID is required",
      });
    }

    // Fetch Google Reviews
    const googleReviews = await fetchGoogleReviews(finalPlaceId);

    if (googleReviews.length === 0) {
      return res.status(200).json({
        status: "success",
        result: [],
        total: 0,
      });
    }

    // Normalize reviews to Hostaway format
    const listingNameForReviews = (listingName as string) || "Unknown Property";
    const normalizedReviews = googleReviews.map((review) =>
      normalizeGoogleReview(review, finalPlaceId, listingNameForReviews)
    );

    // Get approval status from in-memory store (Google reviews are auto-approved by default)
    const approvals = await prisma.reviewApproval.findMany();
    const approvalMap = new Map(approvals.map((a) => [a.reviewId, a.approved]));

    // Add approval status to reviews (default to true for Google reviews)
    const reviewsWithApproval = normalizedReviews.map((review) => ({
      ...review,
      isApproved: approvalMap.get(review.id) ?? true, // Google reviews auto-approved
    }));

    // Serialize dates to ISO strings for JSON response
    const serializedReviews = reviewsWithApproval.map((review) => ({
      ...review,
      date: review.date.toISOString(),
    }));

    res.status(200).json({
      status: "success",
      result: serializedReviews,
      total: serializedReviews.length,
    });
  } catch (error: any) {
    console.error("Error fetching Google Reviews:", error);
    const errorMessage = error?.message || "Internal server error";
    res.status(500).json({
      error: errorMessage,
      details: error?.response?.data || error?.stack,
    });
  }
}
