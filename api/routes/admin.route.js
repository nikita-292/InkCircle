// routes/admin.routes.js
import express from 'express'
import { verifyAdmin } from '../utils/verifyUser.js'
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBooks,
  getPendingbooks,
  reviewBook,
  deleteBook,
  getSiteStats,
  getbooksByAuthor
} from '../controllers/admin.controller.js'

const router = express.Router()

// User management routes
router.get('/users', verifyAdmin, getAllUsers)
router.get('/users/:id', verifyAdmin, getUserById)
router.put('/users/:id', verifyAdmin, updateUser)
router.delete('/users/:id', verifyAdmin, deleteUser)

router.get('/books', verifyAdmin, getAllBooks)
router.get('/books/pending', verifyAdmin, getPendingbooks)
router.put('/books/:id/review', verifyAdmin, reviewBook)
router.delete('/books/:id', verifyAdmin, deleteBook)

router.get('/stats', verifyAdmin, getSiteStats)
router.get('/books/author/:author', verifyAdmin, getbooksByAuthor)

export default router
