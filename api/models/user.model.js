import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: function () {
        // This will be set during document creation based on username
        return this.username
          ? generateAvatarUrl(this.username.charAt(0).toUpperCase())
          : 'https://imgs.search.brave.com/3WZ_P1qGgTWlS-JwL-jDRzhAl5QBOFF0h0q8T2gnuA8/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aXByY2VudGVyLmdv/di9pbWFnZS1yZXBv/c2l0b3J5L2JsYW5r/LXByb2ZpbGUtcGlj/dHVyZS5wbmcvQEBp/bWFnZXMvaW1hZ2Uu/cG5n'
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    archivedbooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
      }
    ],
    recentlyVisitedBooks: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true // Added validation
        },
        visitedAt: {
          type: Date,
          default: Date.now,
          required: true // Ensure visitedAt is always set
        }
      }
    ]
  },
  { timestamps: true }
)
// Helper function to generate avatar URL based on first character
function generateAvatarUrl (firstChar) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${firstChar}`
}

// Improved method for adding visited books
userSchema.methods.addRecentlyVisitedBook = async function(bookId) {
  try {
    // Convert both IDs to string for comparison
    const bookIdStr = bookId.toString();
    
    // Remove existing entry if present
    this.recentlyVisitedBooks = this.recentlyVisitedBooks.filter(
      item => item.book.toString() !== bookIdStr
    );
    
    // Add new entry at beginning
    this.recentlyVisitedBooks.unshift({
      book: bookId,
      visitedAt: new Date()
    });
    
    // Limit to 10 most recent
    if (this.recentlyVisitedBooks.length > 10) {
      this.recentlyVisitedBooks = this.recentlyVisitedBooks.slice(0, 10);
    }
    
    await this.save();
    return this;
  } catch (error) {
    console.error('Error adding visited book:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema)

export default User
