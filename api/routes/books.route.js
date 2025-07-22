import express from 'express'
import {
  getAllBooks,
  likeBook,
  commentOnBook,
  incrementDownload,
  archiveBook,
  getArchives,
  removeArchivebook,
  updateComment,
  deleteComment,
  viewBook
} from '../controllers/books.controller.js'
import { verifyToken } from '../utils/verifyUser.js'

const router = express.Router()

router.post('/archive/:id', verifyToken, archiveBook) // Archive a book
router.get('/archived/:id', verifyToken, getArchives)
router.post('/remove-archive/:id', verifyToken, removeArchivebook) //

router.get('/', getAllBooks) // Get all books
router.get('/:id', verifyToken, viewBook); // View a specific book
router.put('/:id/like', verifyToken, likeBook) // Like/unlike
router.put('/comments/:bookId/:commentId', verifyToken, updateComment) // Edit comment
router.delete('/comments/:bookId/:commentId', verifyToken, deleteComment) // delete comment
router.post('/:id/comment', verifyToken, commentOnBook) // Comment
router.put('/:id/download', incrementDownload) // Increment download count

export default router
