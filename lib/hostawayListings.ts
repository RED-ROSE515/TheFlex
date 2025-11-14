import axios from 'axios';
import { getAccessToken } from './hostawayAuth';

const BASE_URL = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1';

export interface ListingAmenity {
  id: number;
  amenityId: number;
  amenityName: string;
}

export interface ListingImage {
  id: number;
  caption: string;
  url: string;
  sortOrder: number;
}

export interface HostawayListing {
  id: number;
  propertyTypeId?: number;
  name: string;
  externalListingName?: string;
  internalListingName?: string;
  description?: string;
  thumbnailUrl?: string | null;
  address?: string;
  publicAddress?: string;
  city?: string;
  country?: string;
  street?: string;
  zipcode?: string;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  personCapacity?: number;
  listingAmenities?: ListingAmenity[];
  listingImages?: ListingImage[];
  [key: string]: any; // Allow additional properties
}

export interface HostawayListingsResponse {
  status: string;
  result: HostawayListing[];
  count?: number;
}

/**
 * Fetch listings from Hostaway API
 */
export async function fetchHostawayListings(): Promise<HostawayListing[]> {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get<HostawayListingsResponse>(
      `${BASE_URL}/listings`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.status === 'success' && response.data.result) {
      console.log(`Fetched ${response.data.result.length} listings from Hostaway API`);
      return response.data.result;
    }

    console.log('Hostaway API returned unexpected response format');
    return [];
  } catch (error: any) {
    console.error('Error fetching Hostaway listings:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

/**
 * Get listing by ID
 */
export async function getHostawayListingById(listingId: number): Promise<HostawayListing | null> {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get<{ status: string; result: HostawayListing }>(
      `${BASE_URL}/listings/${listingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.status === 'success' && response.data.result) {
      return response.data.result;
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching Hostaway listing:', error.message);
    return null;
  }
}

/**
 * Get listing by name (searches through all listings)
 * Handles both direct name matching and slug-based matching
 * Checks name, internalListingName, and externalListingName
 */
export async function getHostawayListingByName(listingName: string): Promise<HostawayListing | null> {
  try {
    const listings = await fetchHostawayListings();
    const normalizedName = listingName.toLowerCase().trim();
    
    // Helper to normalize names for comparison
    const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[-\s]+/g, ' ').trim();
    
    // Try exact match first on all name fields
    let listing = listings.find(l => {
      const nameMatch = l.name && normalizeForMatch(l.name) === normalizedName;
      const internalMatch = l.internalListingName && normalizeForMatch(l.internalListingName) === normalizedName;
      const externalMatch = l.externalListingName && normalizeForMatch(l.externalListingName) === normalizedName;
      return nameMatch || internalMatch || externalMatch;
    });
    
    // If not found, try matching with spaces/hyphens normalized
    if (!listing) {
      listing = listings.find(l => {
        const searchNormalized = normalizeForMatch(listingName);
        const nameNormalized = l.name ? normalizeForMatch(l.name) : '';
        const internalNormalized = l.internalListingName ? normalizeForMatch(l.internalListingName) : '';
        const externalNormalized = l.externalListingName ? normalizeForMatch(l.externalListingName) : '';
        
        return nameNormalized === searchNormalized ||
               internalNormalized === searchNormalized ||
               externalNormalized === searchNormalized;
      });
    }
    
    // If still not found, try partial match
    if (!listing) {
      listing = listings.find(l => {
        const name = (l.name || '').toLowerCase();
        const internal = (l.internalListingName || '').toLowerCase();
        const external = (l.externalListingName || '').toLowerCase();
        
        return name.includes(normalizedName) ||
               normalizedName.includes(name) ||
               internal.includes(normalizedName) ||
               normalizedName.includes(internal) ||
               external.includes(normalizedName) ||
               normalizedName.includes(external);
      });
    }
    
    return listing || null;
  } catch (error: any) {
    console.error('Error finding listing by name:', error.message);
    return null;
  }
}

