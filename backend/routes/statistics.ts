import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { db } from '../index';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get exam centers statistics
router.get('/exam-centers', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [centers] = await db.execute<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.name,
        s.address,
        COUNT(DISTINCT ss.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN ss.status = 'graded' THEN ss.id END) as graded_submissions,
        COUNT(DISTINCT CASE WHEN ss.status = 'reviewed' THEN ss.id END) as reviewed_submissions,
        ROUND(AVG(g.score), 2) as average_score
      FROM schools s
      LEFT JOIN students st ON s.id = st.school_id
      LEFT JOIN student_submissions ss ON st.id = ss.student_id
      LEFT JOIN grades g ON ss.id = g.submission_id
      GROUP BY s.id, s.name, s.address
      ORDER BY s.name
    `);

    res.json(centers);
  } catch (error) {
    console.error('Error fetching exam centers statistics:', error);
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor centrelor de examen' });
  }
});

// Get subject statistics
router.get('/subjects', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [subjects] = await db.execute<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.name,
        s.code,
        COUNT(DISTINCT ss.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN ss.status = 'graded' THEN ss.id END) as graded_submissions,
        COUNT(DISTINCT CASE WHEN ss.status = 'reviewed' THEN ss.id END) as reviewed_submissions,
        ROUND(AVG(g.score), 2) as average_score
      FROM subjects s
      LEFT JOIN exam_papers ep ON s.id = ep.subject_id
      LEFT JOIN student_submissions ss ON ep.id = ss.exam_paper_id
      LEFT JOIN grades g ON ss.id = g.submission_id
      GROUP BY s.id, s.name, s.code
      ORDER BY s.name
    `);

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subject statistics:', error);
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor materiilor' });
  }
});

// Get overall statistics
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [stats] = await db.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(DISTINCT ss.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN ss.status = 'graded' THEN ss.id END) as graded_submissions,
        COUNT(DISTINCT CASE WHEN ss.status = 'reviewed' THEN ss.id END) as reviewed_submissions,
        ROUND(AVG(g.score), 2) as average_score,
        COUNT(DISTINCT s.id) as total_schools,
        COUNT(DISTINCT sub.id) as total_subjects
      FROM student_submissions ss
      LEFT JOIN grades g ON ss.id = g.submission_id
      LEFT JOIN students st ON ss.student_id = st.id
      LEFT JOIN schools s ON st.school_id = s.id
      LEFT JOIN exam_papers ep ON ss.exam_paper_id = ep.id
      LEFT JOIN subjects sub ON ep.subject_id = sub.id
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching overview statistics:', error);
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor generale' });
  }
});

export default router; 