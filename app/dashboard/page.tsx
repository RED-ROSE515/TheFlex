"use client";

import { useState, useEffect } from "react";
import { NormalizedReview } from "@/lib/mockReviews";
import ReviewCard from "@/components/ReviewCard";
import {
  Filter,
  TrendingUp,
  Star,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Building2,
  Bed,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<NormalizedReview[]>(
    []
  );
  const [listings, setListings] = useState<string[]>([]);
  const [listingsData, setListingsData] = useState<any[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    approved: 0,
    pending: 0,
  });

  // Filters
  const [selectedListing, setSelectedListing] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [minRating, setMinRating] = useState<string>("");
  const [maxRating, setMaxRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "rating" | "listing">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchReviews();
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    reviews,
    selectedListing,
    selectedChannel,
    selectedType,
    selectedStatus,
    minRating,
    maxRating,
    sortBy,
    sortOrder,
  ]);

  const fetchListings = async () => {
    try {
      const response = await axios.get("/api/listings/hostaway");
      if (
        response.data &&
        response.data.status === "success" &&
        response.data.result
      ) {
        // Store full listing data
        setListingsData(response.data.result);

        // Use internalListingName if available, otherwise use name
        const listingNames = response.data.result
          .map(
            (listing: any) =>
              listing.internalListingName ||
              listing.name ||
              listing.externalListingName ||
              ""
          )
          .filter((name: string) => name !== "")
          .sort();
        setListings(listingNames);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/api/reviews/hostaway");
      const data = response.data;
      // Parse date strings back to Date objects
      const reviewsWithDates = data.result.map((review: any) => ({
        ...review,
        date: new Date(review.date),
      }));
      setReviews(reviewsWithDates);
      setFilteredReviews(reviewsWithDates);
      setChannels(data.channels);
      calculateStats(reviewsWithDates);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  const calculateStats = (reviewList: NormalizedReview[]) => {
    const total = reviewList.length;
    const averageRating =
      reviewList.reduce((sum, r) => sum + r.averageRating, 0) / total || 0;
    const approved = reviewList.filter((r) => r.isApproved).length;
    const pending = reviewList.filter((r) => r.status === "pending").length;

    setStats({ total, averageRating, approved, pending });
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    if (selectedListing !== "all") {
      filtered = filtered.filter((r) => r.listingName === selectedListing);
    }

    if (selectedChannel !== "all") {
      filtered = filtered.filter((r) => r.channel === selectedChannel);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((r) => r.type === selectedType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    if (minRating) {
      const min = parseFloat(minRating);
      filtered = filtered.filter((r) => r.averageRating >= min);
    }

    if (maxRating) {
      const max = parseFloat(maxRating);
      filtered = filtered.filter((r) => r.averageRating <= max);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = a.date.getTime() - b.date.getTime();
      } else if (sortBy === "rating") {
        comparison = a.averageRating - b.averageRating;
      } else if (sortBy === "listing") {
        comparison = a.listingName.localeCompare(b.listingName);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredReviews(filtered);
    calculateStats(filtered);
  };

  const handleToggleApproval = async (reviewId: number, approved: boolean) => {
    try {
      const review = reviews.find((r) => r.id === reviewId);
      await axios.post("/api/reviews/approve", {
        reviewId,
        listingName: review?.listingName || "",
        approved,
      });

      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, isApproved: approved } : r
        )
      );
    } catch (error) {
      console.error("Error updating approval:", error);
      alert("Failed to update approval status");
    }
  };

  const getTrendingIssues = () => {
    const categoryRatings: Record<string, { sum: number; count: number }> = {};

    filteredReviews.forEach((review) => {
      review.reviewCategory?.forEach((cat) => {
        if (!categoryRatings[cat.category]) {
          categoryRatings[cat.category] = { sum: 0, count: 0 };
        }
        categoryRatings[cat.category].sum += cat.rating;
        categoryRatings[cat.category].count += 1;
      });
    });

    return Object.entries(categoryRatings)
      .map(([category, data]) => ({
        category,
        average: data.sum / data.count,
      }))
      .sort((a, b) => a.average - b.average)
      .slice(0, 3);
  };

  const getPerPropertyPerformance = () => {
    const propertyStats: Record<
      string,
      {
        name: string;
        totalReviews: number;
        averageRating: number;
        approvedCount: number;
        pendingCount: number;
      }
    > = {};

    filteredReviews.forEach((review) => {
      if (!propertyStats[review.listingName]) {
        propertyStats[review.listingName] = {
          name: review.listingName,
          totalReviews: 0,
          averageRating: 0,
          approvedCount: 0,
          pendingCount: 0,
        };
      }

      const stats = propertyStats[review.listingName];
      stats.totalReviews += 1;
      stats.averageRating += review.averageRating;
      if (review.isApproved) stats.approvedCount += 1;
      if (review.status === "pending") stats.pendingCount += 1;
    });

    // Calculate averages
    return Object.values(propertyStats)
      .map((stats) => ({
        ...stats,
        averageRating:
          stats.totalReviews > 0 ? stats.averageRating / stats.totalReviews : 0,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  };

  const trendingIssues = getTrendingIssues();
  const perPropertyPerformance = getPerPropertyPerformance();

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">
            Loading reviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100">
      {/* Header */}
      <header className="bg-white border-b border-beige-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Reviews Dashboard
              </h1>
              <p className="text-gray-600 mt-1.5 text-sm">
                Manage and analyze guest reviews
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors rounded-lg hover:bg-beige-50"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-7 border border-beige-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Total Reviews
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-teal-50 rounded-xl p-4">
                <MessageSquare className="w-7 h-7 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-7 border border-beige-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Average Rating
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-7 border border-beige-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Approved
                </p>
                <p className="text-4xl font-bold text-teal-600">
                  {stats.approved}
                </p>
              </div>
              <div className="bg-teal-50 rounded-xl p-4">
                <CheckCircle className="w-7 h-7 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-7 border border-beige-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Pending
                </p>
                <p className="text-4xl font-bold text-orange-500 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <AlertCircle className="w-7 h-7 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Per-Property Performance */}
        {perPropertyPerformance.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-beige-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-teal-50 rounded-xl p-3">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Per-Property Performance
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {perPropertyPerformance.map((property, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl p-6 border border-teal-100 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="font-bold text-gray-900 mb-3 text-base">
                    {property.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Avg Rating:
                      </span>
                      <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-lg">
                        {property.averageRating.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Total Reviews:
                      </span>
                      <span className="font-bold text-gray-900">
                        {property.totalReviews}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Approved:
                      </span>
                      <span className="font-bold text-green-600 bg-white px-3 py-1 rounded-lg">
                        {property.approvedCount}
                      </span>
                    </div>
                    {property.pendingCount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">
                          Pending:
                        </span>
                        <span className="font-bold text-orange-600 bg-white px-3 py-1 rounded-lg">
                          {property.pendingCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Issues */}
        {trendingIssues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-beige-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-orange-50 rounded-xl p-3">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Areas for Improvement
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-all duration-300"
                >
                  <p className="text-sm font-semibold text-gray-700 uppercase mb-2 tracking-wide">
                    {issue.category.replace("_", " ")}
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {issue.average.toFixed(1)}/5
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-beige-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-beige-50 rounded-xl p-3">
              <Filter className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Filters & Sorting
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Listing
              </label>
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="all">All Listings</option>
                {listings.map((listing) => (
                  <option key={listing} value={listing}>
                    {listing}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Channel
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="all">All Channels</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="all">All Types</option>
                <option value="guest-to-host">Guest to Host</option>
                <option value="host-to-guest">Host to Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Min Rating
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Max Rating
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={maxRating}
                onChange={(e) => setMaxRating(e.target.value)}
                placeholder="5"
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "rating" | "listing")
                }
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="listing">Listing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content: Listings and Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listings Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-beige-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-50 rounded-xl p-3">
                  <Building2 className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Listings ({listingsData.length})
                </h2>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {listingsData.length === 0 ? (
                  <p className="text-gray-600 text-sm">No listings found.</p>
                ) : (
                  listingsData.map((listing: any) => {
                    const listingName =
                      listing.internalListingName ||
                      listing.name ||
                      listing.externalListingName ||
                      "Unnamed Listing";
                    const reviewCount = reviews.filter(
                      (r) => r.listingName === listingName
                    ).length;
                    const avgRating =
                      reviews
                        .filter((r) => r.listingName === listingName)
                        .reduce((sum, r) => sum + r.averageRating, 0) /
                      (reviewCount || 1);

                    return (
                      <div
                        key={listing.id}
                        className={`listing-card border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                          selectedListing === listingName
                            ? "border-teal-600 bg-gradient-to-br from-teal-50 to-teal-100/50 shadow-md"
                            : "border-beige-200 bg-white hover:border-teal-300"
                        }`}
                        onClick={() => {
                          setSelectedListing(
                            selectedListing === listingName
                              ? "all"
                              : listingName
                          );
                        }}
                      >
                        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">
                          {listingName}
                        </h3>
                        {listing.city && (
                          <p className="text-xs text-gray-600 mb-3 font-medium">
                            {listing.city}, {listing.country || ""}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                            <Bed className="w-3.5 h-3.5 text-gray-600" />
                            <span className="text-gray-700 font-medium">
                              {listing.bedroomsNumber || 0} bed
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-700 font-medium">
                              {reviewCount > 0
                                ? avgRating.toFixed(1)
                                : "No reviews"}
                            </span>
                          </div>
                        </div>
                        {reviewCount > 0 && (
                          <p className="text-xs text-gray-500 mt-2 font-medium">
                            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Reviews ({filteredReviews.length})
              </h2>
            </div>
            <div className="space-y-6">
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-beige-200">
                  <p className="text-gray-600 text-lg font-medium">
                    No reviews match your filters.
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isApproved={review.isApproved}
                    onToggleApproval={handleToggleApproval}
                    showApprovalToggle={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
