 import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Hero from "./Hero.jsx";
import SliderHomePage from "./SliderHomePage.jsx";
import GenreGrid from "./GenreGride.jsx";
import {
  FaBookOpen,
  FaBookmark,
  FaPenFancy,
  FaChartLine,
  FaDownload,
} from "react-icons/fa";

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    // const isLoggedIn = !!localStorage.getItem("token");
    // console.log(currentUser);
    if (currentUser) {
      navigate("/uploading-books");
    } else {
      navigate("/sign-in");
    }
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <Hero handleUploadClick={handleUploadClick} />

      {/* How it Works */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 ">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text">
              How It Works
            </h2>
            <div className="h-1 w-60 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: FaPenFancy,
                title: "Upload Your Books",
                desc: "A home for your words. Post, organize, and let readers discover your work.",
                color: "text-green-600",
              },
              {
                Icon: FaBookmark,
                title: "Content Review",
                desc: "All uploads are reviewed by admins to ensure quality and relevance.",
                color: "text-teal-600",
              },
              {
                Icon: FaChartLine,
                title: "Get Discovered",
                desc: "Reach a wider audience and gain visibility across the platform.",
                color: "text-blue-600",
              },
              {
                Icon: FaDownload,
                title: "Download & Learn",
                desc: "Explore top-rated books and boost your knowledge for free.",
                color: "text-indigo-600",
              },
            ].map(({ Icon, title, desc, color }, idx) => (
              <div
                key={idx}
                className="bg-gray-100 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition"
              >
                <Icon className={`text-4xl mb-4 mx-auto ${color}`} />
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <SliderHomePage />

      {/* Genres*/}
      <section className="py-15 bg-white ">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              📚{" "}
              <span className="bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text">
                Featured Book Categories
              </span>
            </h2>
            <p className="text-center text-black font-medium mb-10">
              Explore our popular book categories curated by our users.
            </p>
          </div>

         <GenreGrid/>
        </div>
      </section>
      {/* quotes from authors */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-transparent bg-clip-text">
              Words That Inspire
            </h2>
            <p className="text-black font-medium">
              From the pages of great books
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="group border border-green-500 p-6 rounded-xl shadow-md max-w-xs text-center transition duration-300 transform hover:-translate-y-1">
              <div className="text-lg italic text-gray-700 mb-4">
                "A reader lives a thousand lives before he dies."
              </div>
              <div className="text-sm font-bold text-green-600 ">
                — George R.R. Martin
              </div>
            </div>

            <div className="group border border-green-500 p-6 rounded-xl shadow-md max-w-xs text-center transition duration-300 transform hover:-translate-y-1">
              <div className="text-lg italic text-gray-700 mb-4">
                "Not all those who wander are lost."
              </div>
              <div className="text-sm font-bold text-green-600">
                — J.R.R. Tolkien
              </div>
            </div>

            <div className="group border border-green-500 p-6 rounded-xl shadow-md max-w-xs text-center transition duration-300 transform hover:-translate-y-1">
              <div className="text-lg italic text-gray-700 mb-4">
                "So many books, so little time."
              </div>
              <div className="text-sm font-bold text-green-600">
                — Frank Zappa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Bold and attractive */}
      <section className="py-15 bg-gradient-to-r from-green-500 to-teal-500 text-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Dive?</h2>
          <p className="text-lg mb-8">
            Start adding your books, writing reviews, and reading new books
            today!
          </p>
          <Link to="/uploading-books">
            <button
              onClick={handleUploadClick}
              className="cursor-pointer bg-red-400 text-white py-3 px-6 rounded-lg hover:bg-red-400 transition duration-300 font-bold text-md shadow-xl transform hover:-translate-y-1"
            >
              Let's get started
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;