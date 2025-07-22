import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

const Updatebooks = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const allGenres = [
    "Fantasy", "Science Fiction", "Mystery", "Thriller", "Horror", "Romance",
    "Adventure", "Fiction", "Non Fiction", "Biography & Memoir", "History",
    "Philosophy", "Psychology", "Politics", "Science & Technology", 
    "Health & Wellness", "Business & Economics", "True Crime", 
    "Educational Books", "Short Stories", "Novellas", "Superhero Comics",
    "Manga", "Spirituality", "Religion", "Mythology", "Literature"
  ];

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    genres: [],
    coverImage: "",
    fileUrl: "",
    uploader: currentUser._id,
  });

  const filteredGenres = allGenres.filter((genre) =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenreSelect = (genre) => {
    if (formData.genres.length >= 5) {
      setError("You can select up to 5 genres only");
      return;
    }
    
    if (!formData.genres.includes(genre)) {
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, genre],
      }));
      setError(false);
    }
    setSearchTerm("");
    setShowGenreDropdown(false);
  };

  const removeGenre = (genreToRemove) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((genre) => genre !== genreToRemove),
    }));
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/uploading/get/${params.updateId}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success === false) {
          throw new Error(data.message);
        }

        // Convert single genre string to array if needed
        const genres = Array.isArray(data.book.genres) 
          ? data.book.genres 
          : data.book.genres ? [data.book.genres] : [];

        setFormData({
          title: data.book.title,
          description: data.book.description,
          author: data.book.author,
          genres: genres,
          coverImage: data.book.coverImage,
          fileUrl: data.book.fileUrl,
          uploader: data.book.uploader,
        });
      } catch (error) {
        console.error("Error fetching book:", error);
        setError(error.message);
      }
    };

    fetchBook();
  }, [params.updateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "genreSearch") {
      setSearchTerm(value);
      setShowGenreDropdown(true);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const form = new FormData();

      // Handle file uploads
      if (file) {
        form.append("file", file);
      } else if (formData.fileUrl) {
        form.append("fileUrl", formData.fileUrl);
      }

      if (coverImage) {
        form.append("coverImage", coverImage);
      } else if (formData.coverImage) {
        form.append("coverImageUrl", formData.coverImage);
      }

      // Add other fields
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("author", formData.author);
      formData.genres.forEach((genre) => {
        form.append("genres[]", genre);
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/uploading/update/${params.updateId}`,
        {
          method: "POST",
          body: form,
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }

      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
      } else {
        alert("Book updated successfully");
        navigate(`/books/${params.updateId}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:px-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
                  <span className="mr-3">📚</span>
                  <span>Let's add something new</span>
                </h1>
                <p className="text-blue-100 mt-2">
                  Update your book details and share the latest version with others!
                </p>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <h2 className="text-lg font-medium text-blue-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Book Information
              </h2>
            </div>

            {/* Two Column Layout for Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  onChange={handleChange}
                  value={formData.title}
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700"
                >
                  Author's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  onChange={handleChange}
                  value={formData.author}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide a brief summary of what this book speaks..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows="4"
                onChange={handleChange}
                value={formData.description}
              ></textarea>
            </div>

            {/* Genre Selection */}
            <div className="space-y-2 relative">
              <label className="block text-sm font-medium text-gray-700">
                Genres <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Max 5 genres)</span>
              </label>
              
              {/* Selected Genres Display */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map((genre, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm shadow-sm"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <input
                type="text"
                id="genreSearch"
                name="genreSearch"
                placeholder="Search and select genres..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onChange={handleChange}
                value={searchTerm}
                onFocus={() => setShowGenreDropdown(true)}
                disabled={formData.genres.length >= 5}
              />

              {/* Genre Dropdown */}
              {showGenreDropdown && filteredGenres.length > 0 && (
                <div 
                  className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                  onMouseLeave={() => setShowGenreDropdown(false)}
                >
                  {filteredGenres.map((genre, index) => (
                    <div
                      key={index}
                      onClick={() => handleGenreSelect(genre)}
                      className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition ${
                        formData.genres.includes(genre) ? "bg-blue-50" : ""
                      }`}
                    >
                      {genre}
                      {formData.genres.includes(genre) && (
                        <span className="ml-2 text-blue-500">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload Sections - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Cover Image Upload */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h2 className="text-lg font-medium text-blue-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cover Image
                  </h2>
                </div>

                <div className="space-y-2">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <div className="space-y-4 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="coverImageUpload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a cover image</span>
                          <input
                            id="coverImageUpload"
                            name="coverImage"
                            type="file"
                            onChange={handleCoverImageChange}
                            accept="image/*"
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG up to 5MB
                      </p>
                      {coverImage && (
                        <p className="text-sm text-green-600">
                          {coverImage.name} selected
                        </p>
                      )}
                      {formData.coverImage && !coverImage && (
                        <p className="text-sm text-green-600">
                          Current image: {formData.coverImage.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Book File Upload */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h2 className="text-lg font-medium text-blue-800 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Book File
                  </h2>
                </div>

                <div className="space-y-2">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <div className="space-y-4 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="fileUpload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="fileUpload"
                            name="file"
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.epub,.mobi"
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, EPUB up to 10MB
                      </p>
                      {file && (
                        <p className="text-sm text-green-600">
                          {file.name} selected
                        </p>
                      )}
                      {formData.fileUrl && !file && (
                        <p className="text-sm text-green-600">
                          Current file: {formData.fileUrl.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-3 pt-4">
              <input
                type="checkbox"
                id="confirm"
                required
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
              />
              <label htmlFor="confirm" className="block text-sm text-gray-700">
                I confirm this is original content and I have permission to
                share it. I understand it will be available to read and download.
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📤</span>
                    Update Your Book
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional info card */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Why update your book?
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-xl mb-2">🔄</div>
              <h4 className="font-medium">Keep Content Fresh</h4>
              <p className="text-sm text-gray-600 mt-1">
                Update your book with the latest information and corrections.
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="text-xl mb-2">👍</div>
              <h4 className="font-medium">Improve Quality</h4>
              <p className="text-sm text-gray-600 mt-1">
                Enhance your book with better explanations, examples, or visuals.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-xl mb-2">📈</div>
              <h4 className="font-medium">Increase Value</h4>
              <p className="text-sm text-gray-600 mt-1">
                Updated books get more downloads and better ratings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Updatebooks;