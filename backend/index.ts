import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createPool } from 'mysql2/promise'
import authRoutes from './routes/auth'
import examPaperRoutes from './routes/exam-papers'
import submissionRoutes from './routes/submissions'
import statisticsRoutes from './routes/statistics'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Database connection
export const db = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bac_exam',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/exam-papers', examPaperRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/statistics', statisticsRoutes)

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'BAC Exam Platform API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})