"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { NormalizedReview } from "@/lib/mockReviews";
import ReviewCard from "@/components/ReviewCard";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Wifi,
  ParkingCircle,
  Home,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function PropertyPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<{
    name: string;
    address: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
    guests: number;
    amenities: string[];
    images: string[];
  } | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);

  // Decode the slug to get the listing name (fallback)
  const listingName = slug ? slug.replace(/-/g, " ") : "";

  useEffect(() => {
    fetchProperty();
  }, [slug]);

  // Fetch reviews when property is loaded
  useEffect(() => {
    if (property) {
      fetchReviews();
    }
  }, [property]);

  const fetchProperty = async () => {
    try {
      setPropertyLoading(true);
      const response = await axios.get(`/api/listings/${slug}`);

      if (
        response.data &&
        response.data.status === "success" &&
        response.data.result
      ) {
        const listingData = response.data.result;
        // Extract amenities from listingAmenities array
        const amenities = listingData.listingAmenities
          ? listingData.listingAmenities.map((a: any) => a.amenityName)
          : ["WiFi", "Kitchen"];

        // Extract images from listingImages array, sorted by sortOrder
        const images = listingData.listingImages
          ? listingData.listingImages
              .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
              .map((img: any) => img.url)
          : [];

        const propertyName = listingData.name || listingData.internalListingName || listingData.externalListingName || listingName;

        setProperty({
          name: propertyName,
          address:
            listingData.publicAddress ||
            listingData.address ||
            `${listingData.street || ""}, ${listingData.city || ""}, ${listingData.country || ""}`.trim() ||
            "Address not available",
          description: listingData.description || `Beautiful property in ${listingData.city || "the area"}.`,
          bedrooms: listingData.bedroomsNumber || 0,
          bathrooms: listingData.bathroomsNumber || 1,
          guests: listingData.personCapacity || 2,
          amenities: amenities,
          images: images,
        });
      } else {
        // Fallback if listing not found
        setProperty({
          name: listingName,
          address: listingName,
          description: "A beautiful property.",
          bedrooms: 2,
          bathrooms: 1,
          guests: 4,
          amenities: ["WiFi", "Kitchen"],
          images: [],
        });
      }
      setPropertyLoading(false);
    } catch (error) {
      console.error("Error fetching property:", error);
      // Fallback on error
      setProperty({
        name: listingName,
        address: listingName,
        description: "A beautiful property.",
        bedrooms: 2,
        bathrooms: 1,
        guests: 4,
        amenities: ["WiFi", "Kitchen"],
        images: [],
      });
      setPropertyLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!property) return;
    
    try {
      setLoading(true);
      // Use the property name to fetch reviews
      const listingNameForReviews = property.name;
      const response = await axios.get(
        `/api/reviews/public?listingName=${encodeURIComponent(listingNameForReviews)}`
      );
      // Parse date strings back to Date objects
      const reviewsWithDates = response.data.reviews.map((review: any) => ({
        ...review,
        date: new Date(review.date),
      }));
      setReviews(reviewsWithDates);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.averageRating, 0) / reviews.length
      : 0;

  if (propertyLoading || !property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Property Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {property.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <MapPin className="w-5 h-5" />
            <span>{property.address}</span>
          </div>

          {/* Property Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">
                {property.bedrooms} Bedroom{property.bedrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">
                {property.bathrooms} Bathroom
                {property.bathrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">
                Up to {property.guests} Guests
              </span>
            </div>
          </div>

          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 inline-block">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${
                          i < Math.round(averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            {property.images.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                  {property.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className={`${
                        idx === 0 ? "col-span-2" : ""
                      } h-64 bg-gray-200 overflow-hidden`}
                    >
                      <img
                        src={img}
                        alt={`${property.name} - Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                About this property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Home className="w-5 h-5 text-blue-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Guest Reviews Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Guest Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <p className="text-gray-600">No reviews available yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isApproved={true}
                      showApprovalToggle={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Book this property
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white">
                    {[...Array(property.guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Guest{i !== 0 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
