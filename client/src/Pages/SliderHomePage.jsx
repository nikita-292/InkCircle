import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    img: "https://i.ibb.co/7NST2yMT/image.png",
    title: "Discover Timeless Classics",
    description: "From Shakespeare to Tolstoy — your literary journey begins here.",
  },
  {
    img: "https://i.ibb.co/NgCrjJzg/image.png",
    title: "Community Feedback",
    description: "Connect with fellow readers by sharing your thoughts on books.",
  },
  {
    img: "https://i.ibb.co/sp3SgmFH/image.png",
    title: "Your Digital Bookshelf",
    description: "Organize books as read or save if you want to Read later.",
  },
  {
    img: "https://i.ibb.co/rRwxB5Hq/image.png",
    title: "Completely Free",
    description: "No charges, no hidden fees - ever.",
  },
  {
    img: "https://i.ibb.co/S4YN9Yym/image.png",
    title: "Data Security",
    description: "Your uploads and downloads stay safe and protected.",
  },
];

const SliderHomePage = () => {
  return (
    <div className="w-full bg-white">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8 pt-6">
      <h2 className="text-4xl font-bold mb-4">
        🫡 Why <span className="text-green-600">Ink</span>
        <span className="text-blue-600 font-extrabold">Circle</span>?
      </h2>
    </div>

    <div className="pb-10">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop={true}
        spaceBetween={30}
        slidesPerView={1}
        className=""
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative group h-[320px] sm:h-[380px] md:h-[420px] overflow-hidden rounded-xl">
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-4 sm:p-6 md:p-8 transition-all duration-500 group-hover:bg-opacity-60">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight">
                  {slide.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base max-w-xl">{slide.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </div>
</div>

  );
};

export default SliderHomePage;