"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { MapPin, Bed, Bath, Users, Star, Home, Search } from "lucide-react";

interface Listing {
  id: number;
  name: string;
  internalListingName?: string;
  externalListingName?: string;
  publicAddress?: string;
  address?: string;
  city?: string;
  country?: string;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  personCapacity?: number;
  listingImages?: Array<{ url: string; sortOrder: number }>;
  thumbnailUrl?: string | null;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchListings();
    fetchReviews();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await axios.get("/api/listings/hostaway");
      if (
        response.data &&
        response.data.status === "success" &&
        response.data.result
      ) {
        setListings(response.data.result);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/api/reviews/hostaway");
      if (response.data && response.data.result) {
        setReviews(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Get review stats for a listing
  const getReviewStats = (listingName: string) => {
    const listingReviews = reviews.filter(
      (r) =>
        r.listingName === listingName ||
        r.listingName?.toLowerCase().includes(listingName.toLowerCase()) ||
        listingName.toLowerCase().includes(r.listingName?.toLowerCase() || "")
    );

    if (listingReviews.length === 0) {
      return { count: 0, averageRating: 0 };
    }

    const averageRating =
      listingReviews.reduce((sum: number, r: any) => sum + r.averageRating, 0) /
      listingReviews.length;

    return {
      count: listingReviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  };

  // Filter listings based on search query
  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const listingName =
      listing.internalListingName ||
      listing.name ||
      listing.externalListingName ||
      "";
    const address = listing.publicAddress || listing.address || "";
    const city = listing.city || "";
    const country = listing.country || "";

    return (
      listingName.toLowerCase().includes(query) ||
      address.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query) ||
      country.toLowerCase().includes(query)
    );
  });

  // Get primary image for listing
  const getPrimaryImage = (listing: Listing) => {
    if (listing.listingImages && listing.listingImages.length > 0) {
      const sortedImages = [...listing.listingImages].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      return sortedImages[0].url;
    }
    return listing.thumbnailUrl || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Our Properties</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, address, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">
              {searchQuery
                ? "No listings found matching your search"
                : "No listings available"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              Showing {filteredListings.length} of {listings.length} properties
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const listingName =
                  listing.internalListingName ||
                  listing.name ||
                  listing.externalListingName ||
                  "Unnamed Property";
                const address =
                  listing.publicAddress ||
                  listing.address ||
                  `${listing.city || ""}, ${listing.country || ""}`.trim() ||
                  "Address not available";
                const primaryImage = getPrimaryImage(listing);
                const reviewStats = getReviewStats(listingName);

                return (
                  <Link
                    key={listing.id}
                    href={`/property/${listing.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={listingName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                          <Home className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {reviewStats.count > 0 && (
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {reviewStats.averageRating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {listingName}
                      </h3>

                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{address}</span>
                      </div>

                      {/* Property Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {listing.bedroomsNumber !== undefined && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{listing.bedroomsNumber} bed</span>
                          </div>
                        )}
                        {listing.bathroomsNumber !== undefined && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{listing.bathroomsNumber} bath</span>
                          </div>
                        )}
                        {listing.personCapacity !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{listing.personCapacity} guests</span>
                          </div>
                        )}
                      </div>

                      {/* Review Count */}
                      {reviewStats.count > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            {reviewStats.count} review
                            {reviewStats.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
