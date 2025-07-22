// src/components/admin/ByAuthors.jsx
import { useState, useEffect } from "react";
import { FileText, Search } from "lucide-react";

const ByAuthors = () => {
  const [authorData, setAuthorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  useEffect(() => {
    // Fetch all books and group by author
    const fetchAuthors = async () => {
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
        
        const booksData = await response.json();
        
        // Group books by author
        const authorMap = {};

        booksData.forEach((Book) => {
          if (!Book.author) return;

          if (!authorMap[Book.author]) {
            authorMap[Book.author] = {
              name: Book.author,
              totalbooks: 0,
              approvedbooks: 0,
              pendingbooks: 0,
              totalDownloads: 0,
            };
          }

          authorMap[Book.author].totalbooks++;

          if (Book.approved) {
            authorMap[Book.author].approvedbooks++;
          } else {
            authorMap[Book.author].pendingbooks++;
          }

          authorMap[Book.author].totalDownloads +=
            Book.downloadCount || 0;
        });
        
        setAuthorData(Object.values(authorMap));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleAuthorClick = async (author) => {
    try {
      setLoading(true);
      const encodedAuthor = encodeURIComponent(author); // Encode special chars
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/books/author/${encodedAuthor}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const authorbooks = await response.json();
      setSelectedAuthor({
        name: author,
        books: authorbooks,
      });
    } catch (err) {
      setError(`Failed to fetch books: ${err.message}`); // Better error message
    } finally {
      setLoading(false);
    }
  };

  const filteredAuthors = authorData.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !selectedAuthor)
    return (
      <div className="flex justify-center items-center h-64">
        Loading author data...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedAuthor
            ? `books from ${selectedAuthor.name}`
            : "Author Management"}
        </h2>

        {selectedAuthor ? (
          <button
            onClick={() => setSelectedAuthor(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to All Authors
          </button>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Search authors..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>
      )}

      {selectedAuthor ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedAuthor.books.length > 0 ? (
                  selectedAuthor.books.map((Book) => (
                    <tr key={Book._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {Book.title}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Book.uploader?.username || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            Book.approved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {Book.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Book.downloadCount || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No books found for this author
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.length > 0 ? (
            filteredAuthors.map((author) => (
              <div
                key={author.name}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => handleAuthorClick(author.name)}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3
                        className="text-lg font-medium text-gray-900 truncate"
                        title={author.name}
                      >
                        {author.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total books</p>
                      <p className="font-bold text-gray-900">
                        {author.totalbooks}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Downloads</p>
                      <p className="font-bold text-gray-900">
                        {author.totalDownloads}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Approved</p>
                      <p className="font-bold text-green-600">
                        {author.approvedbooks}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="font-bold text-yellow-600">
                        {author.pendingbooks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white p-8 rounded-lg shadow text-center">
              <p className="text-lg text-gray-600">
                No authors found matching your search
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ByAuthors;
