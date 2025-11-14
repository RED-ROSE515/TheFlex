import type { NextApiRequest, NextApiResponse } from "next";
import { getHostawayListingById, getHostawayListingByName } from "@/lib/hostawayListings";
import { listingNameToSlug, getPropertyDetailsFromListing } from "@/lib/propertyUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.query;
    
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Invalid slug parameter" });
    }

    let listing = null;

    // Check if slug is a numeric ID (listing ID)
    if (/^\d+$/.test(slug)) {
      // Fetch by ID
      const listingId = parseInt(slug, 10);
      listing = await getHostawayListingById(listingId);
    } else {
      // Convert slug back to listing name - try multiple formats
      // Format 1: Title Case (e.g., "2B-N1-A-29-Shoreditch-Heights" -> "2B N1 A 29 Shoreditch Heights")
      let listingName = slug
        .split("-")
        .map((word) => {
          // Preserve numbers and abbreviations (like "2B", "N1")
          if (/^\d+[A-Za-z]?$/.test(word) || word.length <= 2) {
            return word.toUpperCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");

      // Try to find listing with the converted name
      listing = await getHostawayListingByName(listingName);
      
      // If not found, try with original slug format (replace hyphens with spaces)
      if (!listing) {
        const alternativeName = slug.replace(/-/g, " ");
        listing = await getHostawayListingByName(alternativeName);
      }
    }

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Convert to property details format
    const propertyDetails = getPropertyDetailsFromListing(listing);

    res.status(200).json({
      status: "success",
      result: {
        ...listing,
        ...propertyDetails,
        slug: listingNameToSlug(listing.name || listing.internalListingName || listing.externalListingName || ''),
      },
    });
  } catch (error: any) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error?.message,
    });
  }
}

