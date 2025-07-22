import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header with accent */}
          <div className="bg-green-600 p-1"></div>
          
          <div className="p-8 sm:p-10">
            {/* Title with gradient text */}
            <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Terms and Conditions
            </h1>

            <p className="mb-8 text-gray-700 leading-relaxed">
              By accessing or using <strong className="text-green-600">InkCircle</strong>, you agree to these terms. Please read them carefully.
            </p>

            <div className="space-y-10">
              {/* Section 1 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-green-600 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    1. Platform Usage
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  You agree to use InkCircle responsibly. Any misuse including spamming, unauthorized access, or harmful content will result in account termination.
                </p>
              </div>

              {/* Section 2 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    2. User Accounts
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  You're responsible for maintaining your account credentials. All activity under your account is your responsibility.
                </p>
              </div>

              {/* Section 3 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-indigo-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    3. Content Management
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  You can organize books, write reviews, and track reading progress. Ensure your content is respectful and follows community guidelines.
                </p>
              </div>

              {/* Section 4 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-purple-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    4. Intellectual Property
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  InkCircle's platform design, branding, and content are protected. Unauthorized use without permission is prohibited.
                </p>
              </div>

              {/* Section 5 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-yellow-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    5. Account Termination
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  We reserve the right to suspend or terminate accounts that violate these terms without notice.
                </p>
              </div>

              {/* Section 6 */}
              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-1 bg-red-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    6. Policy Changes
                  </h2>
                </div>
                <p className="text-gray-700 pl-9">
                  These terms may be updated periodically. Continued use after changes constitutes acceptance of the new terms.
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

export default Terms;