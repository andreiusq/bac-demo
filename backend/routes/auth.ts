import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../index'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// login - setează token în cookie HttpOnly
router.post('/login', (req: Request, res: Response) => {
  const loginHandler = async () => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: 'Email și parolă necesare' })
      }

      const [rows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [email])
      const user = rows[0]

      if (!user) {
        return res.status(401).json({ message: 'Utilizator inexistent' })
      }

      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) {
        return res.status(401).json({ message: 'Parolă greșită' })
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '2h' }
      )

      // Setează cookie HttpOnly (secure dacă în producție)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000, // 2 ore
      })

      return res.json({
        message: 'Autentificare reușită',
        user: { id: user.id, email: user.email, name: user.name }
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Eroare server' })
    }
  }

  loginHandler()
})

export interface AuthenticatedRequest extends Request {
  user?: any
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies.token
  if (!token) {
    res.status(401).json({ message: 'Nu ești autentificat' })
    return
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(401).json({ message: 'Token invalid' })
      return
    }
    req.user = user
    next()
  })
}

router.get('/session', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user })
})

export default router