import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import authRoutes from './routes/auth'
import centresRoutes from './routes/centres'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Database connection
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'bac',
})

app.use(cors({ origin: 'http://localhost:3000', credentials: true })) // ajustează origin dacă e nevoie
app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/centres', centresRoutes)

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server funcționează!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server pornit pe portul ${PORT}`)
})