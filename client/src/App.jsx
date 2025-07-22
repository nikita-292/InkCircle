import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Signin from "./Pages/Signin";
import Profile from "./Pages/Profile";
import Signout from "./Pages/Signup.jsx";
import About from "./Pages/About";
import Signup from "./Pages/Signup.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import UploadingBooks from "./Pages/CreateUploading.jsx";
import UpdateBooks from "./Pages/UpdateBooks.jsx";
import Books from "./Pages/Books.jsx";
import BrowseBooks from "./Pages/BrowseBooks.jsx";
import Privacy from  "./components/TC/Privacy.jsx";
import Terms from "./components/TC/Terms.jsx";
import AdminLayout from "./Pages/admin/AdminLayout.jsx";
import Dashboard from "./Pages/admin/Dashboard.jsx";
import UsersManagement from "./Pages/admin/UsersManagement.jsx";
import BooksManagement from "./Pages/admin/BooksManagement.jsx";
import PendingApprovals from "./Pages/admin/PendingApprovals.jsx";
import ByAuthors from "./Pages/admin/ByAuthors.jsx";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const App = () => {
  // Get user and loading state from Redux store
  const { currentUser: user, loading } = useSelector((state) => state.user);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading)
      return (
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      );

    if (!user) {
      return <Navigate to="/signin" />;
    }

    if (user.role !== "admin") {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
   
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />}></Route>

        <Route path="/sign-in" element={<Signin />}></Route>
        <Route path="/sign-up" element={<Signup />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/browse" element={<BrowseBooks />}></Route>
         {/* ✅ Privacy and Terms Routes */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route element={<PrivateRoute />}>
          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="Books" element={<BooksManagement />} />
            <Route path="pending" element={<PendingApprovals />} />
            <Route path="authors" element={<ByAuthors />} />
          </Route>

          {/* Redirect root to admin dashboard if admin is logged in */}
          <Route
            path="/"
            element={
              loading ? (
                <div className="flex justify-center items-center h-screen">
                  Loading...
                </div>
              ) : user && user.role === "admin" ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route path="/Books/:BooksId" element={<Books />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/uploading-Books" element={<UploadingBooks />}></Route>
          <Route
            path="/update-Books/:updateId"
            element={<UpdateBooks />}
          ></Route>
        </Route>
      </Routes>
      <Footer/>
    </BrowserRouter>
   
  );
};

export default App;
