import axios from "axios";
import { type HostawayReview, mockReviews } from "./mockReviews";
import { getAccessToken } from "./hostawayAuth";

const HOSTAWAY_BASE_URL =
  process.env.HOSTAWAY_BASE_URL || "https://api.hostaway.com/v1";

export interface HostawayApiResponse {
  status: string;
  result: HostawayReview[];
}

/**
 * Fetches reviews from Hostaway API and combines with mock data
 * Returns combined array of real API reviews and mock reviews
 */
export async function fetchHostawayReviews(): Promise<HostawayReview[]> {
  const apiReviews: HostawayReview[] = [];
  
  try {
    // Get access token using OAuth
    const accessToken = await getAccessToken();
    console.log("Access token obtained, fetching reviews...");

    // Try different endpoint patterns that Hostaway might use
    const endpoints = [
      `${HOSTAWAY_BASE_URL}/reviews`,
      `${HOSTAWAY_BASE_URL}/listings/reviews`,
    ];

    // Try each endpoint with Bearer token
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get<HostawayApiResponse>(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });
        
        // Check if API returned successful response with reviews
        if (
          response.data &&
          response.data.status === "success" &&
          response.data.result &&
          Array.isArray(response.data.result) &&
          response.data.result.length > 0
        ) {
          const reviews = response.data.result;
          console.log(`Fetched ${reviews.length} reviews from Hostaway API`);
          apiReviews.push(...reviews);
          break; // Successfully fetched, no need to try other endpoints
        }
      } catch (error: any) {
        // Continue to next endpoint if this one fails
        if (error.response && error.response.status === 404) {
          continue;
        }
        // For other errors, log and continue
        console.log(`Error fetching from ${endpoint}:`, error.message);
        continue;
      }
    }
  } catch (error: any) {
    console.error("Error in fetchHostawayReviews:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    // Don't throw - we'll still return mock data
  }

  // Combine API reviews with mock reviews
  // Use a Set to track IDs and avoid duplicates
  const reviewIds = new Set(apiReviews.map(r => r.id));
  const uniqueMockReviews = mockReviews.filter(r => !reviewIds.has(r.id));
  
  const combinedReviews = [...apiReviews, ...uniqueMockReviews];
  
  console.log(`Returning ${combinedReviews.length} reviews (${apiReviews.length} from API, ${uniqueMockReviews.length} from mock data)`);
  
  return combinedReviews;
}
