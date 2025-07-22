import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice";

const Profile = () => {
  const navigate = useNavigate();
  const [recentlyVisitedBooks, setRecentlyVisitedBooks] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [showUploadsError, setShowUploadsErrors] = useState(false);
  const [userUploads, setUserUploads] = useState([]);
  const [archivedbooks, setArchivedbooks] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState(false);
  const usernameInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const userEmailRef = useRef(null);

  useEffect(() => {
    if (editProfile && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [editProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const fetchRecentlyVisitedBooks = async () => {
    const userId = currentUser?.id || currentUser?._id;
    console.log("Fetching visits for user:", userId); // Debug log

    try {
      setLoadingRecent(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}/recently-visited`,
        { credentials: "include" }
      );

      console.log("Response status:", res.status); // Debug log

      const data = await res.json();
      console.log("Received data:", data); // Debug log

      setRecentlyVisitedBooks(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingRecent(false);
    }
  };
  const handleAddToSaved = async (bookId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/archive/${bookId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success === false) {
        console.error("Failed to add to saved:", data.message);
        return;
      }
      // Refresh both lists
      handleArchive();
    } catch (error) {
      console.error("Error adding to saved:", error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Form data before submission:", formData);
    let userId = currentUser.id || currentUser._id;
    try {
      dispatch(updateUserStart());

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        setErrorMsg(data.message);
        return;
      }
      setEditProfile(false);
      setVerifyPassword(false);
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    let userId = currentUser.id || currentUser._id;
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        setIsDeleting(true);
        dispatch(deleteUserStart());
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/delete/${userId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.success === false) {
          dispatch(deleteUserFailure(data.message));
          setIsDeleting(false);
          return;
        }
        dispatch(deleteUserSuccess(data));
        navigate("/");
      } catch (error) {
        dispatch(deleteUserFailure(error.message));
        setIsDeleting(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signout`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess());
      navigate("/");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowUploads = async () => {
    setActiveTab("uploads");
    let userId = currentUser.id || currentUser._id;

    try {
      setShowUploadsErrors(false);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/uploads/${userId}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success === false) {
        setShowUploadsErrors(true);
        return;
      }

      // console.log("User uploads data:", data);

      setUserUploads(data);
    } catch (error) {
      setShowUploadsErrors(true);
    }
  };

  const handleArchive = async () => {
    setActiveTab("archived");
    try {
      setShowUploadsErrors(false);

      // Fetch archived books
      const archivedRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/archived/${
          currentUser?.id || currentUser?._id
        }`,
        { credentials: "include" }
      );
      const archivedData = await archivedRes.json();
      setArchivedbooks(archivedData);

      // Fetch recently visited books
      await fetchRecentlyVisitedBooks();
    } catch (error) {
      setShowUploadsErrors(true);
      console.error("Error in handleArchive:", error);
    }
  };

  //console.log(currentUser);

  const handleRemoveArchive = async (BookId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/books/remove-archive/${BookId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success === false) {
        console.error("Failed to remove from archive:", data.message);
        return;
      }
      setArchivedbooks((prev) => prev.filter((Book) => Book._id !== BookId));
    } catch (error) {
      console.log("Error removing archived Book:", error.message);
    }
  };

  const handlebooksDelete = async (uploadingId) => {
    if (window.confirm("Are you sure you want to delete this Book?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/uploading/delete/${uploadingId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          return;
        }
        setUserUploads((prev) =>
          prev.filter((uploads) => uploads._id !== uploadingId)
        );
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const cardVariants = {
    hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="relative rounded-full h-16 w-16 overflow-hidden ring-2 ring-white shadow-md">
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  {currentUser.username}
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Member since{" "}
                {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 md:mt-0 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-md hover:from-red-600 hover:to-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-100">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 relative ${
                activeTab === "profile"
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </div>
              {activeTab === "profile" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={handleShowUploads}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 relative ${
                activeTab === "uploads"
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                My Uploads
              </div>
              {activeTab === "uploads" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={handleArchive}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 relative ${
                activeTab === "archived"
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                Saved & Recent Viewed Books
              </div>
              {activeTab === "archived" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <AnimatePresence mode="wait">
            {/* Profile Tab - Keep existing profile tab content */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="p-4 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Side - Profile Picture and Basic Info */}
                  <div className="w-full lg:w-1/3 flex flex-col items-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="relative group mb-6">
                      <div className="relative rounded-full h-36 w-36 overflow-hidden ring-4 ring-white/80 shadow-md">
                        <img
                          src={currentUser.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover cursor-pointer transition-all duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                          <div className="bg-white/90 p-3 rounded-full shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-800"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentUser.username}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {currentUser.email}
                      </p>
                      <div className="flex justify-center mt-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                          Member
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDeleteUser}
                      disabled={isDeleting}
                      className={`mt-8 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                        isDeleting
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 shadow-sm hover:shadow-red-200"
                      }`}
                    >
                      {isDeleting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-gray-400"
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
                          Deleting...
                        </>
                      ) : (
                        <>
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete Account
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Side - Edit Form */}
                  {!verifyPassword ? (
                    <div className="w-full lg:w-2/3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Profile Settings
                        </h3>
                        <div className="flex gap-2">
                          <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-indigo-600 cursor-pointer"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              onClick={() => setEditProfile(!editProfile)}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <form className="space-y-5">
                        <div className="space-y-1">
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Username
                          </label>
                          <div className="relative">
                            <input
                              ref={usernameInputRef}
                              disabled={!editProfile}
                              type="text"
                              placeholder="Username"
                              value={formData.username || currentUser.username}
                              id="username"
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="Email"
                              ref={userEmailRef}
                              disabled={!editProfile}
                              defaultValue={currentUser.email}
                              id="email"
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Change Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="New Password"
                              disabled={!editProfile}
                              id="newPassword"
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {editProfile && (
                          <div className="pt-2 flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditProfile(false);
                                // Reset form values
                                if (usernameInputRef.current) {
                                  usernameInputRef.current.value =
                                    currentUser.username;
                                  userEmailRef.current.value =
                                    currentUser.email;
                                }
                                // Reset other fields as needed
                              }}
                              className="flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              onClick={() => setVerifyPassword(true)}
                              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3.5 rounded-xl font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Save Changes
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  ) : (
                    <div className="w-full lg:w-2/3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Verify Password
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Please enter your current password to save changes
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Enter your password"
                              onChange={handleChange}
                              value={formData.currentPassword || ""}
                              id="currentPassword"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 bg-white/90"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyPassword(false),
                                (formData.currentPassword = "");
                            }}
                            className="flex-1 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                              />
                            </svg>
                            Go Back
                          </button>

                          <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3.5 rounded-xl font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Verify and Save
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          {errorMsg && (
                            <p
                              className="text-red-600 text-sm font-medium border border-red-200 bg-red-50 rounded-md px-3 py-2"
                              role="alert"
                            >
                              {errorMsg}
                            </p>
                          )}
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Uploaded Books Tab - Enhanced Design */}
            {activeTab === "uploads" && (
              <motion.div
                key="uploads"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      My Uploaded Books
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {userUploads.length}{" "}
                      {userUploads.length === 1 ? "book" : "books"} shared with
                      the community
                    </p>
                  </div>
                  <Link
                    to="/uploading-books"
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center gap-2 shadow-sm hover:scale-[1.02]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Upload New Book
                  </Link>
                </div>

                {showUploadsError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-800 rounded-xl mb-6 border border-red-100 flex items-start gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Error loading your uploads</p>
                      <p className="text-sm mt-0.5">
                        Please try refreshing the page or contact support
                      </p>
                    </div>
                  </motion.div>
                )}

                {userUploads.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200"
                  >
                    <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      No books uploaded yet
                    </h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Share your knowledge with the community by uploading your
                      first book
                    </p>
                    <Link
                      to="/uploading-books"
                      className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2.5 px-8 rounded-lg font-medium hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                    >
                      Upload Your First Book
                    </Link>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userUploads.map((upload) => (
                      <motion.div
                        key={upload._id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Link to={`/books/${upload._id}`} className="block">
                          <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
                            <img
                              src={
                                upload.coverImage ||
                                "https://cdn-icons-png.flaticon.com/512/337/337946.png"
                              }
                              alt={upload.title}
                              className="max-h-full max-w-full object-contain rounded shadow-md"
                            />
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                              {upload.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(upload.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {upload.genres.slice(0, 3).map((genre, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {genre}
                                </span>
                              ))}
                              {upload.genres.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{upload.genres.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <div className="border-t border-gray-100 px-5 py-3 flex justify-between">
                          <button
                            onClick={() => handlebooksDelete(upload._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1.5 transition"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                          <Link
                            to={`/update-books/${upload._id}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1.5 transition"
                          >
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Saved Books Tab - Enhanced Design */}
            {activeTab === "archived" && (
              <motion.div
                key="archived"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="p-4 sm:p-6"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Your Saved Books
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {archivedbooks.length} saved{" "}
                    {archivedbooks.length === 1 ? "book" : "books"} •{" "}
                    {recentlyVisitedBooks.length} recently viewed
                  </p>
                </div>

                {showUploadsError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 text-red-800 rounded-xl mb-6 border border-red-100 flex items-start gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Error loading your books</p>
                      <p className="text-sm mt-0.5">
                        Please try refreshing the page or contact support
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-8">
                  {/* Saved Books Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                        Saved Books
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          ({archivedbooks.length})
                        </span>
                      </h4>
                    </div>

                    {archivedbooks.length === 0 ? (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          No saved books yet
                        </h4>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Save books you want to read later by clicking the
                          "Save" button
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archivedbooks.map((book) => (
                          <motion.div
                            key={book._id}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <Link to={`/books/${book._id}`} className="block">
                              <div className="h-48 bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
                                <img
                                  src={
                                    book.coverImage ||
                                    "https://cdn-icons-png.flaticon.com/512/337/337946.png"
                                  }
                                  alt={book.title}
                                  className="max-h-full max-w-full object-contain rounded shadow-md"
                                />
                              </div>
                              <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                  {book.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Saved on{" "}
                                  {new Date(
                                    book.archivedAt || book.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {book.genres
                                    .slice(0, 3)
                                    .map((genre, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                                      >
                                        {genre}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </Link>
                            <div className="border-t border-gray-100 px-5 py-3 flex justify-between">
                              <Link
                                to={`/books/${book._id}`}
                                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1.5 transition"
                              >
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Read
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveArchive(book._id);
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1.5 transition"
                              >
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Recently Visited Books Section */}
<div>
  <div className="flex justify-between items-center mb-4">
    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-600"
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
      Recently Viewed
      <span className="text-sm font-normal text-gray-500 ml-1">
        ({recentlyVisitedBooks.length})
      </span>
    </h4>
  </div>

  {loadingRecent ? (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  ) : recentlyVisitedBooks.length === 0 ? (
    <div className="empty-state">
      <p>No recently viewed books yet</p>
      <button
        onClick={() => navigate("/browse")}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Browse Books
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {recentlyVisitedBooks.map((book) => {
    // Safely access book data from _doc or fallback to root
    const bookData = book._doc || book;
    
    return (
      <motion.div
        key={bookData?._id || `book-${Math.random().toString(36).substr(2, 9)}`}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <Link to={`/books/${bookData._id}`} className="block">
          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <img
              src={bookData.coverImage || "https://cdn-icons-png.flaticon.com/512/337/337946.png"}
              alt={bookData.title || "Book cover"}
              className="max-h-full max-w-full object-contain rounded shadow-md"
            />
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {bookData.title || "Untitled Book"}
            </h3>
            <p className="text-sm text-gray-500">
              Viewed on {book.visitedAt ? new Date(book.visitedAt).toLocaleDateString() : "Unknown date"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {bookData.genres?.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </Link>
        <div className="border-t border-gray-100 px-5 py-3 flex justify-between">
          <Link
            to={`/books/${bookData._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5 transition"
          >
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Again
          </Link>
          <button
            onClick={() => bookData._id && handleAddToSaved(bookData._id)}
            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1.5 transition"
          >
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            Save
          </button>
        </div>
      </motion.div>
    );
  })}
</div>
  )}
</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
