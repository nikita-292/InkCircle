import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    required: true,
    default: 'Anonymous'
  },
  text: {
    type: String,
    required: true
  },
  commentedAt: {
    type: Date,
    default: Date.now
  }
})

const bookschema = new mongoose.Schema({
  title: {
    type: String,
    required: true // name of the book
  },
  description: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String
    // required: true, // PDF/file upload URL
  },
  coverImage: { type: String, required: true }, // Path to the image
  
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    required: true // publishing name
  },
  genres: {
    type: [String],
    required: [true, "At least one genre is required"],
    validate: [arrayLimit, "At least one genre is required"],
    // custom validator named arrayLimit .. array is not empty even if it technically exists
    set: function (genres) {
      return genres.map((genre) => genre.toLowerCase().replace(/s$/, ""));
    },
    //replace(/s$/, "") → removes a trailing "s" if there is one (e.g., "comics" → "comic"
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  approved: {
    type: Boolean,
    default: false // Admin approval
  },
  comments: {
    type: [commentSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
function arrayLimit(val) {
  return val.length > 0;
}

const Book = mongoose.model('Book', bookschema)
export default Book
