import { useState, useEffect } from "react";
import {
  Eye,
  Download,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Filter,
  FileText,
  BookAIcon,
  User,
  ChevronDown,
  X,
  Check,
  Clock,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Library,
  FilePlus2,
  Loader2
} from "lucide-react";

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [authors, setAuthors] = useState([]);
  const [viewingBook, setViewingBook] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/books`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      setBooks(data);

      // Extract unique authors
      const uniqueAuthors = [
        ...new Set(data.map((book) => book.author)),
      ].filter(Boolean);
      setAuthors(uniqueAuthors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/books/${bookId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete book");
        }

        setBooks(books.filter((book) => book._id !== bookId));
        if (viewingBook?._id === bookId) setViewingBook(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleApproveReject = async (bookId, approved) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/books/${bookId}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update book status");
      }

      const updatedBook = await response.json();
      setBooks(books.map((book) => (book._id === bookId ? updatedBook : book)));
      if (viewingBook?._id === bookId) setViewingBook(updatedBook);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedBooks = [...books].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredBooks = sortedBooks.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.uploader?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAuthor = authorFilter ? book.author === authorFilter : true;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
        ? book.approved
        : !book.approved;

    return matchesSearch && matchesAuthor && matchesStatus;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-inner">
              <Library className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Books Management
              </h1>
              <p className="text-gray-500 mt-1">
                Review and manage your library collection
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books by title, author or uploader..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {books.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Approved Books
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {books.filter((n) => n.approved).length}
                </p>
                <p className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="ml-1">
                    {books.length > 0
                      ? `${Math.round(
                          (books.filter((n) => n.approved).length /
                            books.length) *
                            100
                        )}% approval rate`
                      : "0% approval rate"}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Review
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {books.filter((n) => !n.approved).length}
                </p>
                <p className="mt-2 flex items-center text-sm font-medium text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span className="ml-1">Awaiting approval</span>
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <Bookmark className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookAIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="absolute right-2 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Book Detail Modal */}
        {viewingBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {viewingBook.title}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        {viewingBook.author || "Unknown Author"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingBook(null)}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Uploaded By</span>
                    </div>
                    <p className="mt-1 font-medium text-gray-800">
                      {viewingBook.uploader?.username || "Unknown"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Downloads</span>
                    </div>
                    <p className="mt-1 font-medium text-gray-800">
                      {viewingBook.downloadCount || 0}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Upload Date</span>
                    </div>
                    <p className="mt-1 font-medium text-gray-800">
                      {new Date(viewingBook.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Status</span>
                    </div>
                    <p
                      className={`mt-1 font-medium ${
                        viewingBook.approved
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {viewingBook.approved ? "Approved" : "Pending Review"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700">
                      {viewingBook.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {viewingBook.fileUrl && (
                  <div className="mt-6">
                    <a
                      href={viewingBook.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Book
                    </a>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                  {!viewingBook.approved ? (
                    <button
                      onClick={() => {
                        handleApproveReject(viewingBook._id, true);
                        setViewingBook({ ...viewingBook, approved: true });
                      }}
                      className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Check className="h-5 w-5" />
                      Approve Book
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleApproveReject(viewingBook._id, false);
                        setViewingBook({ ...viewingBook, approved: false });
                      }}
                      className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Clock className="h-5 w-5" />
                      Set to Pending
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteBook(viewingBook._id);
                      setViewingBook(null);
                    }}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">
                      Title
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortConfig.key === "title" &&
                          sortConfig.direction === "desc"
                            ? "transform rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("author")}
                  >
                    <div className="flex items-center gap-1">
                      Author
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortConfig.key === "author" &&
                          sortConfig.direction === "desc"
                            ? "transform rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("uploader")}
                  >
                    <div className="flex items-center gap-1">
                      Uploader
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortConfig.key === "uploader" &&
                          sortConfig.direction === "desc"
                            ? "transform rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("approved")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortConfig.key === "approved" &&
                          sortConfig.direction === "desc"
                            ? "transform rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("downloadCount")}
                  >
                    <div className="flex items-center gap-1">
                      Downloads
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortConfig.key === "downloadCount" &&
                          sortConfig.direction === "desc"
                            ? "transform rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <tr
                      key={book._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {book.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(book.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {book.author || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {book.uploader?.username || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            book.approved
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {book.approved ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {book.downloadCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setViewingBook(book)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!book.approved ? (
                            <button
                              onClick={() => handleApproveReject(book._id, true)}
                              className=" text-green-600 hover:text-green-900 p-1.5 rounded-full hover:bg-green-50 "
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleApproveReject(book._id, false)
                              }
                              className="p-1.5 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
                              title="Set to Pending"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FilePlus2 className="h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">
                          No books found
                        </h3>
                        <p className="mt-1 text-gray-500 max-w-md">
                          {searchTerm || authorFilter || statusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "The library is currently empty. Add some books to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksManagement;