import Book from "../models/uploading.model.js";
import { errorHandler } from "../utils/error.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import https from "https";

// Load environment variables
dotenv.config();

// Validate Cloudinary configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary configuration in environment variables");
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Test Cloudinary connection
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch((err) => console.error("❌ Cloudinary connection failed:", err));

// Configure multer with memory storage
const storage = multer.memoryStorage();

// Enhanced file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log("Accepting file:", file.originalname, file.mimetype);
    cb(null, true);
  } else {
    console.log("Rejecting file:", file.originalname, file.mimetype);
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

// Improved Cloudinary upload function
const uploadToCloudinary = async (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `books/${Date.now()}-${path.parse(originalname).name}`,
        overwrite: true,
        format: path.extname(originalname).substring(1) || "pdf",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("Upload successful:", result.secure_url);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const booksUploading = async (req, res, next) => {
  // Set proper CORS headers
  res.header("Access-Control-Allow-Origin", "https://ink-circle.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");

  try {
    // console.log("Request files:", req.files);
    // console.log("Request body:", req.body);

    // Validate required fields first
    const requiredFields = ["title", "author", "genres"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Handle file upload - more flexible validation
    let fileUrl, fileName, fileType;
    if (req.files?.file?.[0]) {
      const file = req.files.file[0];
      const result = await uploadToCloudinary(file.buffer, file.originalname);
      fileUrl = result.secure_url;
      fileName = file.originalname;
      fileType = file.mimetype;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      fileName = req.body.fileName || "Uploaded File";
      fileType = req.body.fileType || "application/octet-stream";
    } else {
      return res.status(400).json({
        success: false,
        message: "No file or file URL provided",
      });
    }

    // Handle cover image upload - more flexible validation
    let coverImageUrl;
    if (req.files?.coverImage?.[0]) {
      const cover = req.files.coverImage[0];
      const result = await uploadToCloudinary(cover.buffer, cover.originalname);
      coverImageUrl = result.secure_url;
    } else if (req.body.coverImageUrl) {
      coverImageUrl = req.body.coverImageUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: "No cover image provided",
      });
    }

    // Ensure uploader is set
    const uploaderId = req.user?.id || req.body.uploader;
    if (!uploaderId) {
      return res.status(400).json({
        success: false,
        message: "Uploader information missing",
      });
    }

    // Create new Book
    const newBook = await Book.create({
      title: req.body.title,
      description: req.body.description || "",
      author: req.body.author,
      genres: Array.isArray(req.body.genres)
        ? req.body.genres
        : [req.body.genres],
      coverImage: coverImageUrl,
      uploader: uploaderId,
      fileUrl,
      fileName,
      fileType,
    });

    return res.status(201).json({
      success: true,
      message: "Book uploaded successfully",
      data: newBook,
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error occurred",
    });
  }
};

// Export multer middleware
export const uploadMiddleware = upload;

export const deletebooks = async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(errorHandler(404, "books not found"));
  }

  if (req.user.id !== book.uploader.toString()) {
    return next(errorHandler(401, "You can only delete your own uploads"));
  }

  try {
    // If the file is on Cloudinary, delete it
    if (book.fileUrl && book.fileUrl.includes("cloudinary.com")) {
      const publicId = book.fileUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json("books has been deleted");
  } catch (error) {
    next(error);
  }
};

export const updatebooks = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(errorHandler(404, "book not found"));
    }

    if (req.user.id !== book.uploader.toString()) {
      return next(errorHandler(401, "You can only update your own uploads"));
    }

    // Update file if present
    if (req.files?.file?.[0]) {
      try {
        // Delete old file if it exists on Cloudinary
        if (book.fileUrl && book.fileUrl.includes("cloudinary.com")) {
          const publicId = book.fileUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        // Upload new file to Cloudinary using the buffer
        const file = req.files.file[0];
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        book.fileUrl = result.secure_url;
        book.fileName = file.originalname;
        book.fileType = file.mimetype;
      } catch (error) {
        console.error("File update error:", error);
        return res.status(500).json({
          success: false,
          message: "Error updating file",
        });
      }
    }
    // Update cover image if present
    if (req.files?.coverImage?.[0]) {
      try {
        // Delete old cover if it exists
        if (book.coverImage && book.coverImage.includes("cloudinary.com")) {
          const publicId = book.coverImage.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Upload new cover
        const cover = req.files.coverImage[0];
        const result = await uploadToCloudinary(
          cover.buffer,
          cover.originalname
        );
        book.coverImage = result.secure_url;
      } catch (error) {
        console.error("Cover image update error:", error);
        return res.status(500).json({
          success: false,
          message: "Error updating cover image",
        });
      }
    }

    // Update other fields
    if (req.body.title) book.title = req.body.title;
    if (req.body.description) book.description = req.body.description;
    if (req.body.author) book.author = req.body.author;
    if (req.body.genres) {
      book.genres = Array.isArray(req.body.genres)
        ? req.body.genres
        : [req.body.genres];
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const getbooks = async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(errorHandler(404, "books not found"));
  }

  try {
   
    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    next(error);
  }
};

// New function to get all books with filtering
export const getAllBooks = async (req, res, next) => {
  try {
    const { search, title, author, genres } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter (searches title, description, and author)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { auhtor: { $regex: search, $options: "i" } },
      ];
    }

    // Add other filters
    if (title) filter.titleName = { $regex: title, $options: "i" };
    if (genres) filter.genres = { $regex: genres, $options: "i" };
    if (author) filter.author = { $regex: author, $options: "i" };

    // Get books with populated user data
    const books = await Book
      .find(filter)
      .populate("uploader", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// Function to download a file
export const downloadbook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return next(errorHandler(404, "Book not found"));
    }

    if (!book.fileUrl) {
      return next(errorHandler(404, "File not found for this book"));
    }

    // Set the appropriate headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${book.fileName}"`
    );

    // If you want to set the content type based on the file's type
    if (book.fileType) {
      res.setHeader("Content-Type", book.fileType);
    }

    // Proxy the request to Cloudinary instead of redirecting
    // You can use a library like 'axios' or Node's built-in http/https

    https
      .get(book.fileUrl, (fileResponse) => {
        // Pipe the file data directly to the response
        fileResponse.pipe(res);

        // Handle any errors in the file download stream
        fileResponse.on("error", (err) => {
          console.error("Error downloading file from Cloudinary:", err);
          next(errorHandler(500, "Error downloading file"));
        });
      })
      .on("error", (err) => {
        console.error("Error connecting to Cloudinary:", err);
        next(errorHandler(500, "Error connecting to file server"));
      });
  } catch (error) {
    console.error("Download error:", error);
    next(error);
  }
};
