import { Router, Request, Response } from 'express'
import { authenticateToken, AuthenticatedRequest } from './auth'

const router = Router()

const centres = [
  { id: 1, name: "Colegiul Național 'Andrei Mocanu'", edition: "2025", exam: "BAC" },
  { id: 2, name: "Liceul Jador", edition: "2025", exam: "BAC" },
  { id: 3, name: "Bogdan de la Ploiesti", edition: "2025", exam: "BAC" },
]

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ centres })
})

export default router
