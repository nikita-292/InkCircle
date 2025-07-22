import React from "react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header with accent */}
          <div className="bg-green-600 p-1"></div>
          
          <div className="p-8 sm:p-10">
            {/* Title with gradient text */}
            <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Privacy Policy
            </h1>

            <p className="mb-8 text-gray-700 leading-relaxed">
              At <strong className="text-green-600">InkCircle</strong>, your privacy is our priority. This
              policy explains how we collect, use, and protect your information when
              you use our digital bookshelf platform.
            </p>

            <div className="space-y-10">
              {/* Section 1 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-green-600 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    1. Information We Collect
                  </h2>
                </div>
                <ul className="list-disc list-inside pl-6 space-y-2 text-gray-700">
                  <li>Name, email address, and profile image (via Firebase Authentication)</li>
                  <li>Your added books, reviews, and reading status</li>
                  <li>Interaction logs (likes, upvotes, preferences)</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    2. How We Use Your Data
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  We use your information to provide core features: organizing books,
                  managing reading lists, and delivering a personalized experience. We
                  also use anonymized data to improve InkCircle.
                </p>
              </div>

              {/* Section 3 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-indigo-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    3. Data Sharing
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  We do not sell your data. We only share necessary info with trusted
                  services like Firebase, for authentication and storage, while ensuring
                  your data is secured.
                </p>
              </div>

              {/* Section 4 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-purple-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    4. Security Measures
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  We use encryption and industry-standard practices to safeguard your
                  data. However, no system can guarantee complete security.
                </p>
              </div>

              {/* Section 5 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-yellow-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    5. Your Rights
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  You can update your profile, delete your account, or request data
                  removal by contacting our support team or via account settings.
                </p>
              </div>

              {/* Section 6 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-red-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    6. Policy Updates
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  We may update this policy periodically. Updates will be posted here,
                  and your continued use of InkCircle confirms your acceptance.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Last updated: June 5, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;