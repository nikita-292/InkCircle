import User from '../models/user.model.js'
import Book from '../models/uploading.model.js'
import { errorHandler } from '../utils/error.js'

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const users = await User.find().select('-password') // Exclude password field
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

// Get user by ID (admin only)
export const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return next(errorHandler(404, 'User not found'))
    }
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

// Update user (admin only)
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const { username, email, role } = req.body
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found'))
    }
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return next(errorHandler(404, 'User not found'))
    }

    await Book.deleteMany({ uploader: req.params.id })

    res.status(200).json({
      message: 'User and all associated content deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Get all books (admin only)
export const getAllBooks = async (req, res, next) => {
  try {
    // console.log(req.user);
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const books = await Book.find().populate('uploader', 'username email')
    res.status(200).json(books)
  } catch (error) {
    next(error)
  }
}

// Get pending approval books (admin only)
export const getPendingbooks = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const pendingbooks = await Book.find({ approved: false }).populate(
      'uploader',
      'username email'
    )
    res.status(200).json(pendingbooks)
  } catch (error) {
    next(error)
  }
}

// Approve or reject Book (admin only)
export const reviewBook = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const { approved } = req.body
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    )

    if (!updatedBook) {
      return next(errorHandler(404, 'Book not found'))
    }
    
    res.status(200).json(updatedBook)
  } catch (error) {
    next(error)
  }
}

// Delete Book (admin only)
export const deleteBook = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const book = await Book.findByIdAndDelete(req.params.id)
    console.log(book)
    if (!book) {
      return next(errorHandler(404, 'Book not found'))
    }
    res.status(200).json({ message: 'Book deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Get site statistics (admin only)
export const getSiteStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Access denied: Admin privileges required'))
    }

    const totalUsers = await User.countDocuments()
    const totalbooks = await Book.countDocuments()
    const pendingApprovals = await Book.countDocuments({ approved: false })
    const totalDownloads = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ])

    const mostDownloadedbooks = await Book.find()
      .sort({ downloadCount: -1 })
      .limit(5)
      .populate('uploader', 'username')

    res.status(200).json({
      totalUsers,
      totalbooks,
      pendingApprovals,
      totalDownloads: totalDownloads[0]?.total || 0,
      mostDownloadedbooks
    })
  } catch (error) {
    next(error)
  }
}

// // Get books by author (admin filter)
// export const getbooksByAuthor = async (req, res, next) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return next(errorHandler(403, 'Access denied: Admin privileges required'))
//     }

//     const { author } = req.params;
//     if (!author) {
//       return next(errorHandler(400, 'Author name is required'));
//     }
//     const books = await Book.find({  author: { $regex: new RegExp(author, 'i') }  }).populate(
//       'uploader',
//       'username email'
//     );
//     if (books.length === 0) {
//       return res.status(404).json({ message: 'No books found for this author' });
//     }
//     res.status(200).json(books)
//   } catch (error) {
//     next(error)
//   }
// }
export const getbooksByAuthor = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(errorHandler(403, 'Admin access required'));
    }
    // console.log(req)
    const author = decodeURIComponent(req.params.author); // Decode first!
    if (!author) {
      return next(errorHandler(400, 'Author name is required'));
    }

    // Exact match (case-insensitive)
    const books = await Book.find({ 
      author: { $regex: new RegExp(`^${author}$`, 'i') }
    }).populate('uploader', 'username email');

    if (!books.length) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};