import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoMdDownload, IoMdHeart } from "react-icons/io";
import { FaRegCommentDots, FaExternalLinkAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useSelector } from "react-redux";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

// Custom Autocomplete Dropdown Component
const AutocompleteDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  allowMultiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update filtered options when input changes
  useEffect(() => {
    if (inputValue === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelectOption = (option) => {
    if (allowMultiple) {
      const currentValues = inputValue ? inputValue.split(",") : [];
      if (currentValues.includes(option)) {
        const newValues = currentValues.filter((v) => v !== option);
        setInputValue(newValues.join(","));
        onChange(newValues.join(","));
      } else {
        const newValues = [...currentValues, option];
        setInputValue(newValues.join(","));
        onChange(newValues.join(","));
      }
    } else {
      setInputValue(option);
      onChange(option);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          className="border border-base-300 w-full p-2 pr-10 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {inputValue && (
          <button
            className="absolute right-8 top-2 text-gray-800/50 hover:text-gray-800/70"
            onClick={handleClear}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <button
          className="absolute right-2 top-2 text-gray-800/50 hover:text-gray-800/70"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-base-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                onClick={() => handleSelectOption(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-800/70">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

const Browsebooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const suggestionRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  const [filters, setFilters] = useState({
    title: "",
    author: "",
    genres: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    title: [],
    author: [],
    genres: [],
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  function getColorForBook(book) {
    const colors = [
      "#4B3F72", // Royal Purple
      "#5F0F40", // Deep Maroon
      "#ED254E", // Vivid Pink
      "#1D3557", // Strong Indigo
      "#F77F00", // Dark Amber
      "#D72638", // Crimson Red
      "#3F88C5", // Strong Blue
      "#F49D37", // Rich Orange
      "#140F2D", // Deep Navy
      "#1FAB89", // Bold Teal
    ];

    // Choose based on genre (if available) or title hash fallback
    const key = book.genres?.[0] || book.title || "";
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/books`,
        {
          params: {
            search: search || "",
            title: filters.title,
            author: filters.author,
            genres: filters.genres,
          },
        }
      );
      setBooks(response.data.books);
      if (filterOptions.title.length === 0) {
        extractFilterOptions(response.data.books);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const extractFilterOptions = (booksData) => {
    const titles = [
      ...new Set(booksData.map((book) => book.title).filter(Boolean)),
    ];
    const authors = [
      ...new Set(booksData.map((book) => book.author).filter(Boolean)),
    ];
    const allGenres = booksData.flatMap((book) => book.genres || []);
    const uniqueGenres = [...new Set(allGenres.filter(Boolean))];

    setFilterOptions({
      title: titles || [],
      author: authors || [],
      genres: uniqueGenres || [],
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  const resetFilters = () => {
    setFilters({
      title: "",
      author: "",
      genres: "",
    });
    setSearch("");
  };

  const downloadFile = async (url, filename) => {
    if (!url) return;
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const openComments = (book) => {
    setSelectedBook(book);
    setCommentText("");
  };

  const commentsRef = useRef(null);

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/books/${selectedBook._id}/comment`, {
        text: commentText,
      });
      setSelectedBook(res.data.comments);
      setCommentText("");
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, filters.title, filters.author, filters.genres]);

  const handleDownload = async (book) => {
    currentUser ? downloadFile(book.fileUrl, book.title) : navigate("/sign-in");
    try {
      const res = await api.put(`/books/${book._id}/download`);
      if (res.data.success) {
        console.log("Download count incremented successfully");
        setBooks({ ...books, downloadCount: books.downloadCount + 1 });
      }
    } catch (error) {
      console.error("Error downloading books:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          📚 <span className="text-blue-600">Dive</span>{" "}
          <span className="text-indigo-700">Into</span>{" "}
          <span className="text-purple-600">Stories</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Browse our extensive collection of books across all genres. Find your
          next adventure today!
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="relative mb-8" ref={suggestionRef}>
          <div className="flex items-center border-2 border-indigo-200 rounded-full overflow-hidden shadow-lg bg-white">
            <div className="p-4 text-indigo-500">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="p-4 w-full focus:outline-none bg-transparent text-gray-700 placeholder-gray-400 text-lg"
              placeholder="Search for title, author, or specific genre..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl shadow-md">
          <AutocompleteDropdown
            label="Filter by title"
            value={filters.title}
            onChange={(value) => handleFilterChange("title", value)}
            options={filterOptions.title}
            placeholder="Harry Potter, The Hobbit, etc."
          />
          <AutocompleteDropdown
            label="Filter by author"
            value={filters.author}
            onChange={(value) => handleFilterChange("author", value)}
            options={filterOptions.author}
            placeholder="e.g., J.K. Rowling"
          />
          <AutocompleteDropdown
            label="Filter by Genre"
            value={filters.genres}
            onChange={(value) => handleFilterChange("genres", value)}
            options={filterOptions.genres || []}
            placeholder="e.g. fiction, comic, romance"
            allowMultiple={true}
          />
        </div>

        <div className="flex justify-end mb-8">
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Books Grid Section */}
      <div className="max-w-7xl mx-auto">
        {!selectedBook && !isLoading ? (
          books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div
                    className="h-2"
                    style={{ backgroundColor: getColorForBook(book) }}
                  ></div>
                  <div className="relative pt-[100%] overflow-hidden">
                    <img
                      src={
                        book.coverImage ||
                        "https://cdn-icons-png.flaticon.com/512/337/337946.png"
                      }
                      alt={book.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/337/337946.png";
                      }}
                    />
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-semibold">Author:</span>{" "}
                      {book.author || "Unknown"}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {book.genres?.slice(0, 3).map((genre, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-red-500">
                        <IoMdHeart className="mr-1" />
                        <span className="text-sm font-semibold">
                          {book?.likes?.length || 0}
                        </span>
                      </div>
                      <div className="flex gap-2">
                       
<button
  onClick={async () => {
    setSelectedBook(book);
    // Track the visit
    if (currentUser) {
      try {
        await api.get(`/books/${book._id}`);
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    }
  }}
  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
>
  Quick View
</button>
                        <button
  onClick={async () => {
    if (currentUser) {
      try {
        await api.get(`/books/${book._id}`);
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    }
    navigate(`/books/${book._id}`);
  }}
  className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
>
  Full Page
</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No books found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          )
        ) : null}

        {isLoading && (
          <div className="flex justify-center my-16">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Book Details Modal */}
        {selectedBook && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8 relative">
                {/* Close Button (Top Right) */}
                <button
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Book Cover (Enhanced) */}
                  <div className="md:col-span-1 flex flex-col">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border-4 border-white">
                      <img
                        src={
                          selectedBook.coverImage ||
                          "https://cdn-icons-png.flaticon.com/512/337/337946.png"
                        }
                        alt={selectedBook.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/512/337/337946.png";
                        }}
                      />
                    </div>
                    <div className="mt-4 flex justify-center space-x-3">
                      <button
                        onClick={() => handleDownload(selectedBook)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all"
                      >
                        <IoMdDownload className="mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => navigate(`/books/${selectedBook._id}`)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all"
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        Full View
                      </button>
                    </div>
                  </div>

                  {/* Book Details (Enhanced) */}
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        {selectedBook.title}
                      </h2>
                      <p className="text-lg text-gray-600 mb-4">
                        by{" "}
                        <span className="font-medium">
                          {selectedBook.author || "Unknown Author"}
                        </span>
                      </p>

                      {/* Rating/Stats Bar */}
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="flex items-center text-yellow-500">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 16a1 1 0 100 2h14a1 1 0 100-2H3zm7-14a1 1 0 00-1 1v8.586l-2.293-2.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 11.586V3a1 1 0 00-1-1z" />
                          </svg>

                          <span className="font-medium text-gray-700">
                            {selectedBook.downloadCount}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <IoMdHeart className="text-red-500 mr-1" />
                          <span>{selectedBook?.likes?.length || 0} Likes</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaRegCommentDots className="text-blue-500 mr-1" />
                          <span>{selectedBook.comments.length} Comments</span>
                        </div>
                      </div>

                      {/* Genre Chips */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedBook.genres?.map((genre, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full shadow-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        About This Book
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedBook.description ||
                          "No description available."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comments Section (Enhanced) */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaRegCommentDots className="text-blue-500 mr-3" />
                    Community Discussion
                  </h3>

                  {/* Comment Input */}
                  <div className="mb-8 bg-gray-50 p-6 rounded-xl shadow-inner">
                    <textarea
                      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      placeholder="Share your thoughts about this book..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows="3"
                    />
                    <button
                      onClick={addComment}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md flex items-center"
                    >
                      Post Comment
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Comments List */}
                  <div ref={commentsRef} className="space-y-6">
                    {selectedBook.comments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      </div>
                    ) : (
                      selectedBook.comments.map((comment, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        >
                          <div className="flex items-start">
                            <div className="bg-indigo-100 p-2 rounded-full mr-4">
                              <CgProfile className="text-indigo-600 text-xl" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-semibold text-gray-800 mr-2">
                                  {comment.username}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    comment.commentedAt
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browsebooks;
