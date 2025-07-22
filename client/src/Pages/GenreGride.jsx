import {
  FaDragon,
  FaBrain,
  FaFeatherAlt,
  FaSkull,
  FaUser,
  FaBook,
} from "react-icons/fa";
import { MdAutoStories } from "react-icons/md";

const genres = [
  {
    name: "Fiction",
    icon: <MdAutoStories />,
    animation: "animate-wiggle",
  },
  {
    name: "Non-fiction",
    icon: <FaBrain />,
    animation: "animate-float",
  },
  {
    name: "Fantasy",
    icon: <FaDragon />,
    animation: "animate-pop",
  },
  {
    name: "Thriller",
    icon: <FaFeatherAlt />,
    animation: "hover:scale-125",
  },
  {
    name: "Horror",
    icon: <FaSkull />,
    animation: "hover:rotate-6",
  },
  {
    name: "Biography",
    icon: <FaUser />,
    animation: "hover:-translate-y-1",
  },
];

export default function GenreGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {genres.map((genre, idx) => (
        <div
          key={idx}
          className="group border border-black rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg"
        >
          <div
            className={`text-4xl mb-3 text-gray-700 transition duration-300 group-hover:text-green-600 ${genre.animation}`}
          >
            {genre.icon}
          </div>
          <p className="font-semibold text-sm group-hover:text-green-600 transition">
            {genre.name}
          </p>
        </div>
      ))}
    </div>
  );
}
