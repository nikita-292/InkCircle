import Book from '../models/uploading.model.js'
import User from '../models/user.model.js'
import { errorHandler } from '../utils/error.js'

// controllers/bookController.js

export const removeArchivebook = async (req, res) => {
  try {
    const bookId = req.params.id

    const book = await Book.findById(bookId)
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: 'book not found.' })

    book.archived = false // Mark book as not archived
    await book.save()

    // Also remove from user.archivedbooks array
    const userId = req.user.id
    await User.findByIdAndUpdate(userId, {
      $pull: { archivedbooks: bookId }
    })

    res
      .status(200)
      .json({ success: true, message: 'book removed from archive.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong.' })
  }
}

export const archiveBook = async (req, res, next) => {
  try {
    const bookId = req.params.id

    const userId = req.user.id

    const book = await Book.findById(bookId)
    if (!book) {
      return next(errorHandler(404, 'book not found'))
    }

    const user = await User.findById(userId)

    // If already archived, don't add again
    if (user.archivedbooks.includes(bookId)) {
      return res
        .status(200)
        .json({ success: true, message: 'book already archived' })
    }

    // Add the book to the user's archive
    user.archivedbooks.push(bookId)
    await user.save()

    res
      .status(200)
      .json({ success: true, message: 'book archived successfully' })
  } catch (error) {
    next(error)
  }
}

export const  getArchives = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('archivedbooks')
    // console.log(user);
    res.status(200).json(user.archivedbooks)
  } catch (error) {
    next(error)
  }
}

// 🔍 Get all books with optional search/filter
export const getAllBooks = async (req, res, next) => {
  try {
    const { search, title,author,genres} = req.query

    const query = {}

    // Search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genres: { $in: [new RegExp(search, 'i')] } } // Search within genres array
      ];
    }

    // Exact match filters
    if (title) query.title = title;
    if (author) query.author = { $regex: author, $options: 'i' };
    
    // Genre filter - matches if any genre in array matches
    if (genres) {
      // Handle both single genre and comma-separated multiple genres
      const genreArray = genres.split(',').map(g => g.trim().toLowerCase());
      query.genres = { $in: genreArray };
    }


    const books = await Book.find(query)
      .populate('uploader', 'name avatar') // if avatar added
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, books })
  } catch (err) {
    next(err)
  }
}

// ❤ Like/unlike book
export const likeBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    const userId = req.user.id

    if (!book) return res.status(404).json({ message: 'book not found' })

    const index = book.likes.indexOf(userId)
    if (index === -1) {
      book.likes.push(userId)
    } else {
      book.likes.splice(index, 1)
    }

    await book.save()
    res.status(200).json({ success: true, likes: book.likes })
  } catch (err) {
    next(err)
  }
}

// 💬 Comment on book
export const commentOnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'book not found' })

    const comment = {
      user: req.user.id,
      text: req.body.text,
      commentedAt: new Date(),
      username: req.user.username
    }

    //console.log(comment)

    book.comments.push(comment)
    await book.save()

    const updatedbook = await Book.findById(req.params.id).populate(
      'comments.user'
    )

     console.log(updatedbook.comments)

    res.status(200).json({
      success: true,
      comments: updatedbook
    })
  } catch (err) {
    console.log(err)

    next(err)
  }
}

export const updateComment = async (req, res, next) => {
  const { bookId, commentId } = req.params
  const { text } = req.body
  // console.log('Authenticated User:', req.user);
  // console.log('comId : ', commentId)
  // console.log('bookId : ', bookId)

  try {
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ message: 'book not found' })

    const comment = book.comments.id(commentId)
    if (!comment) return res.status(404).json({ message: 'Comment not found' })

    comment.text = text
    comment.commentedAt = new Date() // Update the timestamp

    await book.save()
    const updatedbook = await Book.findById(bookId).populate(
      'comments.user',
      'name'
    )
    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comments: updatedbook.comments
    })
  } catch (err) {
    next(err)
  }
}

export const deleteComment = async (req, res, next) => {
  const { bookId, commentId } = req.params
  try {
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ message: 'book not found' })

    book.comments.pull(commentId)
    await book.save()

    const updatedbook = await Book.findById(bookId).populate(
      'comments.user',
      'name'
    )
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      comments: updatedbook.comments
    })
  } catch (err) {
    next(err)
  }
}

// ⬇ Increment download count
export const incrementDownload = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'book not found' })

    book.downloadCount += 1
    await book.save()

    res.status(200).json({ success: true, downloadCount: book.downloadCount })
  } catch (err) {
    next(err)
  }
}


export const viewBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return next(errorHandler(404, 'Book not found'));

    if (req.user?.id) {
      console.log('Recording visit for user:', req.user.id, 'to book:', book._id);
      const user = await User.findById(req.user.id);
      
      if (!user) {
        console.log('User not found');
        return next(errorHandler(404, 'User not found'));
      }
      
      await user.addRecentlyVisitedBook(book._id);
      await user.save();
      console.log('Visit recorded successfully');
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('Error in viewBook:', error);
    next(error);
  }
};