import dotenv from 'dotenv'
dotenv.config()

// In an ESM file (e.g., .mjs or .js with "type": "module")
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// can use require
const fs = require('fs')
const coreJs = require('core-js')

import express from 'express'
import mongoose from 'mongoose'

import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import uploadingRouter from './routes/uploading.route.js'
import booksRouter from './routes/books.route.js'
import adminRoutes from './routes/admin.route.js'
import cors from 'cors'
import { verifyToken } from './utils/verifyUser.js'

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to DB')
  })
  .catch(err => {
    console.log(err)
  })

const app = express();

// CORS configuration - IMPORTANT: This must be before any other middleware

const allowedOrigins = [process.env.FRONTEND_URL,'https://ink-circle.vercel.app']

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Then use other middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))


const Port = process.env.PORT || 3000
app.listen(Port, () => {
  console.log(`Server is running at port ${Port}`)
})
// test
app.get('/api/cors-test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

app.get('/', (req, res) => {
  res.send('Hello from Ink Circle API')
})

// Simple test endpoint to verify CORS is working
app.get('/api/test-cors', (req, res) => {
  res.json({ success: true, message: 'CORS is working correctly!' })
})

app.use('/api/books', booksRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/uploading', uploadingRouter)
app.use('/api/admin', adminRoutes)

// Error handler - make sure it preserves CORS headers
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Send error response with appropriate CORS headers already set
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message
  })
})
