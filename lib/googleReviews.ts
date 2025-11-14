/**
 * Google Reviews Integration Exploration
 *
 * This file contains research and findings on integrating Google Reviews
 * with the Flex Living Reviews Dashboard.
 */

/**
 * Google Places API Integration Options:
 *
 * 1. Google Places API (New) - Recommended
 *    - Endpoint: https://places.googleapis.com/v1/places/{placeId}/reviews
 *    - Requires: API Key with Places API enabled
 *    - Cost: Pay-as-you-go pricing
 *    - Rate Limits: Based on your quota
 *
 * 2. Google My Business API (Deprecated)
 *    - No longer available for new integrations
 *    - Existing integrations may continue to work
 *
 * 3. Google Places API (Legacy)
 *    - Endpoint: https://maps.googleapis.com/maps/api/place/details/json
 *    - Still functional but Google recommends migrating to new API
 *
 * Implementation Challenges:
 *
 * 1. Place ID Requirement
 *    - Need to obtain Google Place ID for each property
 *    - Can be found via Places API Place Search or manually
 *
 * 2. Authentication
 *    - Requires Google Cloud API Key
 *    - Must enable Places API in Google Cloud Console
 *    - Should restrict API key to specific domains/IPs for security
 *
 * 3. Rate Limiting
 *    - Free tier: $200 credit/month (covers ~40,000 requests)
 *    - Need to implement caching to avoid excessive API calls
 *
 * 4. Data Structure Differences
 *    - Google Reviews have different structure than Hostaway
 *    - Need normalization layer to match Hostaway format
 *
 * 5. Review Moderation
 *    - Google Reviews cannot be hidden/approved like Hostaway
 *    - All published reviews are public
 *    - Would need to filter on frontend only
 *
 * Recommended Approach:
 *
 * 1. Use Google Places API (New) for better long-term support
 * 2. Implement caching (24-hour cache) to reduce API calls
 * 3. Store Place IDs in database for each property
 * 4. Create normalization function to convert Google format to Hostaway format
 * 5. Add Google Reviews as a separate channel in the dashboard
 *
 * Example Implementation Structure:
 *
 * ```typescript
 * interface GoogleReview {
 *   author_name: string;
 *   rating: number;
 *   text: string;
 *   time: number; // Unix timestamp
 *   relative_time_description: string;
 * }
 *
 * function normalizeGoogleReview(
 *   review: GoogleReview,
 *   placeId: string,
 *   listingName: string
 * ): NormalizedReview {
 *   return {
 *     id: generateUniqueId(), // Need to generate or use time-based ID
 *     type: 'guest-to-host',
 *     status: 'published',
 *     rating: review.rating,
 *     publicReview: review.text,
 *     reviewCategory: [], // Google doesn't provide category breakdown
 *     submittedAt: new Date(review.time * 1000).toISOString(),
 *     guestName: review.author_name,
 *     listingName: listingName,
 *     channel: 'Google',
 *     averageRating: review.rating,
 *     date: new Date(review.time * 1000),
 *   };
 * }
 * ```
 *
 * Security Considerations:
 *
 * 1. Never expose API key in frontend code
 * 2. Create backend API route to proxy Google API calls
 * 3. Implement rate limiting on your backend
 * 4. Cache responses to minimize API usage
 *
 * Cost Estimation:
 *
 * - Places API (New): $17 per 1,000 requests
 * - With 10 properties, fetching reviews daily: ~300 requests/month
 * - Estimated cost: ~$5/month
 *
 * Alternative Solutions:
 *
 * 1. Embed Google Reviews Widget
 *    - Simple iframe embed
 *    - No API integration needed
 *    - Less control over display
 *
 * 2. Third-party Services
 *    - Services like ReviewPush, Podium, etc.
 *    - May aggregate multiple review sources
 *    - Additional cost but easier integration
 *
 * Conclusion:
 *
 * Google Reviews integration is feasible but requires:
 * - Google Cloud account setup
 * - API key management
 * - Place ID collection for each property
 * - Caching strategy
 * - Additional normalization logic
 *
 * For MVP, recommend focusing on Hostaway integration first,
 * then adding Google Reviews as Phase 2 enhancement.
 */

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  reviews?: GoogleReview[];
}

import axios from "axios";
import {
  HostawayReview,
  normalizeReview,
  NormalizedReview,
} from "./mockReviews";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const GOOGLE_PLACES_API_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

// In-memory cache for Google Reviews (24-hour TTL)
const reviewCache = new Map<
  string,
  { data: GoogleReview[]; timestamp: number }
>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch Google Reviews from Google Places API
 * Uses caching to reduce API calls
 */
export async function fetchGoogleReviews(
  placeId: string
): Promise<GoogleReview[]> {
  // Check cache first
  const cached = reviewCache.get(placeId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached Google Reviews for place ${placeId}`);
    return cached.data;
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn(
      "Google Places API key not configured. Returning empty array."
    );
    return [];
  }

  try {
    const response = await axios.get(GOOGLE_PLACES_API_URL, {
      params: {
        place_id: placeId,
        fields: "name,reviews",
        key: GOOGLE_PLACES_API_KEY,
      },
      timeout: 10000,
    });

    if (
      response.data &&
      response.data.status === "OK" &&
      response.data.result
    ) {
      const reviews = response.data.result.reviews || [];

      // Cache the results
      reviewCache.set(placeId, {
        data: reviews,
        timestamp: Date.now(),
      });

      console.log(
        `Fetched ${reviews.length} Google Reviews for place ${placeId}`
      );
      return reviews;
    } else if (response.data && response.data.status === "ZERO_RESULTS") {
      console.log(`No reviews found for place ${placeId}`);
      return [];
    } else {
      console.error(
        `Google Places API error: ${response.data?.status || "Unknown error"}`
      );
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching Google Reviews:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return [];
  }
}

/**
 * Normalize Google Review to Hostaway format
 */
export function normalizeGoogleReview(
  review: GoogleReview,
  placeId: string,
  listingName: string
): NormalizedReview {
  // Generate a unique ID based on place ID and review time
  const reviewId = parseInt(
    `${placeId.replace(/\D/g, "").slice(-6)}${review.time}`,
    10
  );

  // Convert Google review to Hostaway format
  const hostawayReview: HostawayReview = {
    id: reviewId,
    type: "guest-to-host", // Google reviews are always guest-to-host
    status: "published", // Google reviews are always published
    rating: review.rating,
    publicReview: review.text || "",
    reviewCategory: [], // Google doesn't provide category breakdown
    submittedAt: new Date(review.time * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19),
    guestName: review.author_name || "Anonymous",
    listingName: listingName,
    channel: "Google",
  };

  // Use the existing normalizeReview function
  return normalizeReview(hostawayReview);
}

/**
 * Get Google Place ID from address or name
 * This is a helper function to find Place ID
 */
export async function findPlaceId(
  address: string,
  name?: string
): Promise<string | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("Google Places API key not configured");
    return null;
  }

  try {
    const searchQuery = name ? `${name}, ${address}` : address;

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
      {
        params: {
          input: searchQuery,
          inputtype: "textquery",
          fields: "place_id",
          key: GOOGLE_PLACES_API_KEY,
        },
        timeout: 10000,
      }
    );

    if (
      response.data &&
      response.data.status === "OK" &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      return response.data.candidates[0].place_id;
    }

    return null;
  } catch (error: any) {
    console.error("Error finding Place ID:", error.message);
    return null;
  }
}
