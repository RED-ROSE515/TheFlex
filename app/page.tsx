import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-beige-100">
      {/* Header */}
      <header className="bg-white border-b border-beige-200 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-teal-600" />
              <h1 className="text-2xl font-bold text-gray-900">Flex Living</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/property"
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                Properties
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Reviews Dashboard & Property Management
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Manage guest reviews, analyze property performance, and showcase the
            best feedback from your guests.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/property"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Browse Properties
              <Building2 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Powerful Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-beige-200">
              <div className="bg-teal-50 rounded-xl p-4 w-fit mb-6">
                <BarChart3 className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Review Analytics
              </h4>
              <p className="text-gray-600">
                Track performance metrics, average ratings, and identify areas
                for improvement across all your properties.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-beige-200">
              <div className="bg-teal-50 rounded-xl p-4 w-fit mb-6">
                <Star className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Review Management
              </h4>
              <p className="text-gray-600">
                Approve, filter, and organize guest reviews. Control which
                reviews are displayed publicly on your property pages.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-beige-200">
              <div className="bg-teal-50 rounded-xl p-4 w-fit mb-6">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Property Insights
              </h4>
              <p className="text-gray-600">
                Get detailed insights per property with review counts, ratings,
                and approval status to make data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-t border-beige-200 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  150+
                </div>
                <div className="text-gray-600 font-medium">
                  Properties Managed
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  10K+
                </div>
                <div className="text-gray-600 font-medium">
                  Reviews Processed
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">4.8</div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl p-12 border border-teal-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Start managing your property reviews and gain valuable insights
              today.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-beige-200 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Building2 className="w-6 h-6 text-teal-600" />
              <span className="text-gray-900 font-semibold">Flex Living</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2025 Flex Living. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
