import React from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaPlusCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import TrueFocus from "../Animation/trueFocus";

const Hero = ({ handleUploadClick }) => {
  return (
    <div className="relative flex items-center justify-center min-h-[80vh]  my-3.5 rounded-2xl overflow-hidden">
      {/* Background Image - Larger Size with Rounded Corners */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(https://i.ibb.co/wF1HLPz6/pexels-ivo-rainha-527110-1290141.jpg)",
        }}
      />

      {/* Darker Overlay with Rounded Corners */}
      <div className="absolute inset-0 bg-black/70 rounded-2xl" />

      {/* Centered Content - Positioned Correctly */}
      <div className="relative z-10 w-full max-w-2xl mx-4 text-center text-white">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to{" "}
          <span className="text-green-400">
            <TrueFocus
              sentence="Ink Circle"
              manualMode={false}
              blurAmount={5}
              borderColor="white"
              animationDuration={2}
              pauseBetweenAnimations={0.5}
            />
          </span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl font-semibold mb-8 text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Read your favourites, add your books, write reviews, and build your
          digital bookshelf!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex justify-center gap-3 sm:gap-4 w-full">
  {/* Add Book Button */}
  <button
    onClick={handleUploadClick}
    className="flex items-center justify-center gap-1 sm:gap-2 
             bg-green-400 border border-green-400 text-black 
             py-2 px-4 rounded-lg hover:bg-green-500 
            text-md font-medium  min-w-[140px]"
  >
    <FaPlusCircle className="text-black text-sm" />
    <span>Add Book</span>
  </button>

  {/* Browse Button */}
  <Link to="/browse" className="" >
    <button className=" flex items-center justify-center gap-1 sm:gap-2 
                      bg-transparent border border-blue-500 text-blue-500 
                      py-2 px-4 rounded-lg hover:bg-blue-500 hover:text-white 
                       text-md  font-medium  min-w-[140px]">
      <FaBookOpen />
      <span>Explore Books</span>
    </button>
  </Link>
</div>

        </motion.div>
      </div>
    </div>
  );
};

export default Hero;