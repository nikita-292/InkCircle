import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IoMdDownload, IoMdShare, IoMdArchive, IoMdEye } from "react-icons/io";
import {
  FaEdit,
  FaTrash,
  FaHeart,
  FaComment,
  FaCheckCircle,
  FaBook,
  FaClipboardList,
  FaUser,
  FaTags,
} from "react-icons/fa";
import { BsEmojiTear } from "react-icons/bs";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

const books = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [books, setbooks] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [commentsExpanded, setCommentsExpanded] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleArchive = async (bookId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/archive/${bookId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("book archived successfully ✅");
      } else {
        showToast(data.message || "Failed to archive the book ❌", "error");
      }
    } catch (error) {
      console.error("Error archiving book:", error);
      showToast("Something went wrong while archiving 🚨", "error");
    }
  };

  // Toast notification helper
  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.replace("opacity-100", "opacity-0");
      toast.classList.add("translate-y-4");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const startEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(commentText);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const saveEditedComment = async (commentId) => {
    if (!editedCommentText.trim()) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/comments/${books._id}/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text: editedCommentText }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setbooks({
          ...books,
          comments: books.comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, text: editedCommentText }
              : comment
          ),
        });
        setEditingCommentId(null);
        setEditedCommentText("");
        showToast("Comment updated successfully");
      } else {
        showToast(data.message || "Failed to update comment ❌", "error");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast("Something went wrong while updating comment 🚨", "error");
    }
  };

  const deleteComment = async (commentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This comment will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/books/comments/${books._id}/${commentId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          const data = await res.json();

          if (res.ok && data.success) {
            setbooks({
              ...books,
              comments: books.comments.filter(
                (comment) => comment._id !== commentId
              ),
            });
            Swal.fire("Deleted!", "Your comment has been deleted.", "success");
          } else {
            Swal.fire("Error", "Could not delete comment.", "error");
          }
        } catch (error) {
          console.error("Error deleting comment:", error);
          Swal.fire("Error", "Something went wrong while deleting comment.", "error");
        }
      }
    });
  };

  const likeBook = async (bookId) => {
    try {
      await api.put(`/books/${bookId}/like`);
      setIsLiked(!isLiked);
      fetchbooks();
      showToast(isLiked ? "Removed like from book" : "Book liked successfully");
    } catch (err) {
      console.error("Error liking book:", err);
      showToast("Failed to like book", "error");
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/books/${params.BooksId}/comment`, {
        text: commentText,
      });

      if (res.data) {
        const currentComments = Array.isArray(books.comments)
          ? books.comments
          : [];

        if (Array.isArray(res.data.comments)) {
          setbooks({
            ...books,
            comments: res.data.comments,
          });
        } else if (res.data.comment) {
          setbooks({
            ...books,
            comments: [...currentComments, res.data.comment],
          });
        } else if (typeof res.data === "object") {
          const newComment = {
            _id: res.data._id || Date.now().toString(),
            text: commentText,
            username: res.data.username || "You",
            commentedAt: res.data.commentedAt || new Date().toISOString(),
          };

          setbooks({
            ...books,
            comments: [...currentComments, newComment],
          });
        }
        showToast("Comment added successfully ✅");
        fetchbooks();
      }
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
      showToast("Failed to add comment ❌", "error");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.put(`/books/${params.BooksId}/download`);
      if (res.data.success) {
        setbooks({ ...books, downloadCount: books.downloadCount + 1 });
        fetchbooks();
        showToast("Download started successfully");
      }
    } catch (error) {
      console.error("Error downloading books:", error);
      showToast("Something went wrong while downloading 🚨", "error");
    }
  };

  const fetchbooks = async () => {
    try {
      setLoading(true);
      
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/uploading/get/${params.BooksId}`
      );
      const data = await res.json();

      if (data.success === false) {
        setError(true);
        return;
      }
      setbooks(data.book);
      // Check if current user has liked the book
      if (currentUser && data.book.likes?.includes(currentUser.id)) {
        setIsLiked(true);
      }
      setError(false);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchbooks();
  }, [params.BooksId]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center mt-10 mb-10 text-center px-4"
      >
        <BsEmojiTear className="text-[100px] text-error animate-bounce mb-4" />
        <h2 className="text-3xl md:text-4xl font-extrabold text-error mb-2">
          Book Not Found!
        </h2>
        <p className="text-base-content/80 text-lg md:text-xl max-w-md mb-6">
          We couldn't find the book you're looking for. It might have been removed or never existed.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn btn-outline btn-primary"
        >
          🔙 Go Back
        </button>
      </motion.div>
    );
  }

  if (!books) return null;

  return (
    <main className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Simplified Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            {books.title}
          </h1>
        </motion.div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Description */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 transition-all hover:shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-10">
                {/* Book image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full aspect-[3/4] overflow-hidden rounded-xl border-2 border-indigo-100 shadow-md"
                >
                  <img
                    src={books.coverImage || "https://via.placeholder.com/300x400"}
                    alt={books.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </motion.div>

                {/* Details section */}
                <div className="space-y-6">
                  {/* Author and Genre Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                        <FaUser className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Author</p>
                        <p className="font-medium text-gray-800">{books.author}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full text-purple-600 mt-1">
                        <FaTags className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Genre</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {books.genres.map((genre, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 rounded-full text-sm shadow-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FaClipboardList className="text-indigo-500 mr-2" />
                      Description
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-5 rounded-xl border border-indigo-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {books.description}
                      </p>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => likeBook(books._id)}
                    className={`inline-flex items-center px-5 py-3 rounded-xl transition duration-300 shadow-md ${
                      isLiked 
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    <FaHeart className={`mr-2 ${isLiked ? "text-white" : "text-gray-600"}`} />
                    {isLiked ? "Liked" : "Like"} ({books.likes?.length || 0})
                  </button>

                  {/* Action Buttons */}
                  {books.fileUrl && (
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-4">
                      <a
                        href={books.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-3 rounded-xl transition duration-300 shadow-md"
                      >
                        <IoMdEye className="mr-2" /> View Book
                      </a>
                      <a
                        href={books.fileUrl}
                        target="_blank"
                        download
                        onClick={handleDownload}
                        className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-3 rounded-xl transition duration-300 shadow-md"
                      >
                        <IoMdDownload className="mr-2" /> Download
                      </a>
                      <button
                        onClick={() => handleArchive(books._id)}
                        className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-5 py-3 rounded-xl transition duration-300 shadow-md"
                      >
                        <IoMdArchive className="mr-2" /> Save
                      </button>
                      <button
                        onClick={handleShare}
                        className="inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-5 py-3 rounded-xl transition duration-300 shadow-md"
                      >
                        <IoMdShare className="mr-2" /> {copied ? "Copied!" : "Share"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>


          
          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 transition-all hover:shadow-lg"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setCommentsExpanded(!commentsExpanded)}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mr-3">
                  <FaComment />
                </div>
                Comments ({books.comments.length})
              </h2>
              <button className="text-gray-500">
                {commentsExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                )}
              </button>
            </div>
                
            {commentsExpanded && (
              <>
                {books.comments.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl mt-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComment className="text-purple-500" size={24} />
                    </div>
                    <p className="text-gray-600">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-5 mt-5">
                    {books.comments.map((comment) => (
                      <li
                        key={
                          comment._id ||
                          comment.id ||
                          Math.random().toString()
                        }
                        className="bg-gradient-to-r from-gray-50 to-indigo-50 p-5 rounded-2xl border border-indigo-100 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium mr-3">
                              {(comment.username || "User")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">
                                {`${comment.username
                                  .slice(0, 1)
                                  .toUpperCase()}${comment.username.slice(
                                  1
                                )}` || "Anonymous User"}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.commentedAt).toLocaleString(
                                  undefined,
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
                          </div>
                          {comment.user == currentUser.id &&
                            comment.username != "Anonymous" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    startEditComment(
                                      comment._id,
                                      comment.text
                                    )
                                  }
                                  className="text-gray-500 hover:text-indigo-600 transition-colors p-1 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => deleteComment(comment._id)}
                                  className="text-gray-500 hover:text-red-600 transition-colors p-1 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                        </div>

                        {editingCommentId === comment._id ? (
                          <div className="mt-3">
                            <textarea
                              value={editedCommentText}
                              onChange={(e) =>
                                setEditedCommentText(e.target.value)
                              }
                              className="w-full p-4 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              rows="3"
                              placeholder="Edit your comment..."
                            />
                            <div className="flex justify-end gap-3 mt-3">
                              <button
                                onClick={cancelEditComment}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditedComment(comment._id)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-md"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 mt-2 pl-13">
                            {comment.text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add new comment section */}
                <div className="mt-8 bg-white rounded-xl border border-indigo-100 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Add your comment
                  </h3>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={addComment}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-md"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      {/* Right column - Stats card */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-8 transition-all hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl text-center border border-indigo-100 shadow-sm">
                  <div className="flex items-center justify-center text-indigo-600 mb-2">
                    <FaHeart size={24} />
                  </div>
                  <p className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                    {books.likes?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl text-center border border-green-100 shadow-sm">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <IoMdDownload size={24} />
                  </div>
                  <p className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                    {books.downloadCount || 0}
                  </p>
                  <p className="text-sm text-gray-600">Downloads</p>
                </div>
              </div>
              {books.approved ? (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                  <FaCheckCircle className="text-blue-600 mr-2" />
                  <span className="text-blue-700 font-medium">
                    Approved by Administrator
                  </span>
                </div>
              ) : (
                <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-2xl flex items-center justify-center border border-yellow-100 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-amber-700 font-medium">
                    Pending Admin Approval
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default books;