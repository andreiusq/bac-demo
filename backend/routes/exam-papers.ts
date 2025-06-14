import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { db } from '../index';

const router = Router();

// Get all exam papers for a session
router.get('/session/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [papers] = await db.execute(
      'SELECT ep.*, s.name as subject_name FROM exam_papers ep JOIN subjects s ON ep.subject_id = s.id WHERE ep.session_id = ?',
      [req.params.sessionId]
    );
    res.json({ papers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching exam papers' });
  }
});

// Create new exam paper
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { session_id, subject_id, exam_date, start_time, duration_minutes, total_points } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO exam_papers (session_id, subject_id, exam_date, start_time, duration_minutes, total_points) VALUES (?, ?, ?, ?, ?, ?)',
      [session_id, subject_id, exam_date, start_time, duration_minutes, total_points]
    );

    res.status(201).json({ message: 'Exam paper created successfully', id: (result as any).insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating exam paper' });
  }
});

// Update exam paper status
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { status } = req.body;
    await db.execute(
      'UPDATE exam_papers SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: 'Exam paper status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating exam paper status' });
  }
});

export default router; 