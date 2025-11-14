import { HostawayListing } from './hostawayListings';

/**
 * Convert listing name to URL slug
 */
export function listingNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert URL slug back to listing name
 */
export function slugToListingName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Find listing by slug
 */
export function findListingBySlug(listings: HostawayListing[], slug: string): HostawayListing | null {
  const listingName = slugToListingName(slug);
  return listings.find(listing => 
    listingNameToSlug(listing.name) === slug || 
    listing.name.toLowerCase() === listingName.toLowerCase()
  ) || null;
}

/**
 * Get property details from Hostaway listing
 */
export function getPropertyDetailsFromListing(listing: HostawayListing) {
  // Extract amenities from listingAmenities array
  const amenities = listing.listingAmenities 
    ? listing.listingAmenities.map(a => a.amenityName)
    : ['WiFi', 'Kitchen']; // Default fallback

  // Extract images from listingImages array, sorted by sortOrder
  const images = listing.listingImages
    ? listing.listingImages
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(img => img.url)
    : [];

  return {
    name: listing.name || listing.internalListingName || listing.externalListingName || 'Property',
    address: listing.publicAddress || listing.address || `${listing.street || ''}, ${listing.city || ''}, ${listing.country || ''}`.trim() || 'Address not available',
    description: listing.description || `Beautiful property in ${listing.city || 'the area'}.`,
    bedrooms: listing.bedroomsNumber || 0,
    bathrooms: listing.bathroomsNumber || 1,
    guests: listing.personCapacity || 2,
    amenities: amenities,
    images: images,
  };
}

