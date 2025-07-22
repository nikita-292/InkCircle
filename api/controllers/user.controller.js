import { errorHandler } from '../utils/error.js'
import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import Book from '../models/uploading.model.js'

export const test = (req, res) => {
  res.json({
    message: 'Hello'
  })
}

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only update your own account!'))
  }

  try {
    const user = await User.findById(req.params.id)
    if (!user) return next(errorHandler(404, 'User not found'))

    // 1. Password validation should only happen if password is being changed
    const isPasswordValid = await bcrypt.compare(
      req.body.currentPassword, // Fixed typo: was 'curretPassword'
      user.password
    )

    //console.log('isPassValid:', isPasswordValid)

    if (!isPasswordValid) {
      return next(errorHandler(401, 'Invalid Password'))
    }

    // 2. Check for existing username/email
    if (req.body.username || req.body.email) {
      const existingUser = await User.findOne({
        $or: [
          ...(req.body.username ? [{ username: req.body.username }] : []),
          ...(req.body.email ? [{ email: req.body.email }] : [])
        ],
        _id: { $ne: req.params.id } // Exclude current user
      })

      if (existingUser) {
        const conflictField =
          existingUser.username === req.body.username ? 'Username' : 'Email'
        return next(errorHandler(409, `${conflictField} already exists`))
      }
    }

    // 3. Prepare update data
    const updateData = {}
    if (req.body.username) updateData.username = req.body.username
    if (req.body.email) updateData.email = req.body.email

    // Only update password if new password is provided
    if (req.body.newPassword) {
      updateData.password = bcrypt.hashSync(req.body.newPassword, 10)
    }

    // 4. Handle avatar update if needed
    // if (req.file?.path) {
    //   updateData.avatar = req.file.path;
    // }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    )

    const { password, ...rest } = updatedUser._doc
    res.status(200).json(rest)
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'))
  try {
    await User.findByIdAndDelete(req.params.id)
    res.clearCookie('token')
    res.status(200).json('User has been deleted')
  } catch (error) {
    next(error)
  }
}

export const getUserUploads = async (req, res, next) => {
  // console.log('User ID:', req.user.id)
  // console.log('Requested ID:', req.params.id)
  if (req.user.id === req.params.id) {
    try {
      const books = await Book.find({ uploader: req.params.id })
      res.status(200).json(books)
    } catch (error) {
      next(error)
    }
  } else {
    return next(errorHandler(401, 'You can only view your own Uploads'))
  }
}

export const getRecentlyVisitedBooks = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('recentlyVisitedBooks')
      .populate({
        path: 'recentlyVisitedBooks.book',
        select: 'title coverImage genres'
      })
      .exec();

    if (!user) return next(errorHandler(404, 'User not found'));

    // Sort by most recent first and limit to 10
    const visits = user.recentlyVisitedBooks
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, 10)
      .map(visit => ({
        ...visit.book,
        visitedAt: visit.visitedAt
      }));

    res.status(200).json(visits);
  } catch (error) {
    next(error);
  }
};