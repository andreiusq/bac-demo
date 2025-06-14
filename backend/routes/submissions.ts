import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { db } from '../index';
import multer from 'multer';
import path from 'path';
import { RowDataPacket, OkPacket } from 'mysql2';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload exam submission
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nu a fost încărcat niciun fișier' });
      return;
    }

    const { examPaperId } = req.body;
    const studentId = req.user?.id;

    // First get the student record
    const [students] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM students WHERE user_id = ?',
      [studentId]
    );

    if (!students || students.length === 0) {
      res.status(404).json({ error: 'Studentul nu a fost găsit' });
      return;
    }

    const studentRecordId = students[0].id;

    const [result] = await db.execute(
      'INSERT INTO student_submissions (student_id, exam_paper_id, file_path, status) VALUES (?, ?, ?, ?)',
      [studentRecordId, examPaperId, req.file.path, 'pending']
    );

    res.status(201).json({ message: 'Lucrarea a fost încărcată cu succes' });
  } catch (error) {
    console.error('Error uploading submission:', error);
    res.status(500).json({ error: 'Eroare la încărcarea lucrării' });
  }
});

// Get submissions for grading
router.get('/for-grading', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.id;

    // First get the teacher record
    const [teachers] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [teacherId]
    );

    if (!teachers || teachers.length === 0) {
      res.status(403).json({ error: 'Nu sunteți autorizat să corectați lucrări' });
      return;
    }

    const [submissions] = await db.execute<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.file_path,
        s.status,
        s.submitted_at,
        u.name as student_name,
        ep.title as exam_title,
        sub.name as subject_name,
        g.score,
        g.feedback,
        g.detailed_scores,
        u2.name as graded_by,
        g.graded_at
      FROM student_submissions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN exam_papers ep ON s.exam_paper_id = ep.id
      JOIN subjects sub ON ep.subject_id = sub.id
      LEFT JOIN grades g ON s.id = g.submission_id
      LEFT JOIN teachers t ON g.teacher_id = t.id
      LEFT JOIN users u2 ON t.user_id = u2.id
      WHERE s.status IN ('pending', 'graded')
      ORDER BY s.submitted_at DESC
    `);

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Eroare la încărcarea lucrărilor' });
  }
});

// Submit grade
router.post('/:submissionId/grade', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { submissionId } = req.params;
    const { score, feedback, detailedScores } = req.body;
    const teacherId = req.user?.id;

    // Get the teacher record
    const [teachers] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [teacherId]
    );

    if (!teachers || teachers.length === 0) {
      res.status(403).json({ error: 'Nu sunteți autorizat să corectați lucrări' });
      return;
    }

    const teacherRecordId = teachers[0].id;

    // Update submission status
    await connection.execute(
      'UPDATE student_submissions SET status = ? WHERE id = ?',
      ['graded', submissionId]
    );

    // Insert grade
    await connection.execute(
      'INSERT INTO grades (submission_id, teacher_id, score, feedback, detailed_scores) VALUES (?, ?, ?, ?, ?)',
      [submissionId, teacherRecordId, score, feedback, JSON.stringify(detailedScores)]
    );

    await connection.commit();
    res.json({ message: 'Nota a fost salvată cu succes' });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting grade:', error);
    res.status(500).json({ error: 'Eroare la salvarea notei' });
  } finally {
    connection.release();
  }
});

// Submit grade review
router.post('/:submissionId/review', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { submissionId } = req.params;
    const { score, feedback, detailedScores, reviewNotes } = req.body;
    const reviewerId = req.user?.id;

    // Get the teacher record
    const [teachers] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM teachers WHERE user_id = ?',
      [reviewerId]
    );

    if (!teachers || teachers.length === 0) {
      res.status(403).json({ error: 'Nu sunteți autorizat să verificați note' });
      return;
    }

    const teacherRecordId = teachers[0].id;

    // Get the initial grade
    const [grades] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM grades WHERE submission_id = ?',
      [submissionId]
    );

    if (!grades || grades.length === 0) {
      res.status(404).json({ error: 'Nu s-a găsit nota inițială' });
      return;
    }

    const initialGrade = grades[0];

    // Insert review
    await connection.execute(
      'INSERT INTO grade_reviews (submission_id, reviewer_id, initial_grade_id, score, feedback, detailed_scores, review_notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        submissionId,
        teacherRecordId,
        initialGrade.id,
        score,
        feedback,
        JSON.stringify(detailedScores),
        reviewNotes
      ]
    );

    // Update submission status
    await connection.execute(
      'UPDATE student_submissions SET status = ? WHERE id = ?',
      ['reviewed', submissionId]
    );

    await connection.commit();
    res.json({ message: 'Verificarea notei a fost salvată cu succes' });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting grade review:', error);
    res.status(500).json({ error: 'Eroare la salvarea verificării notei' });
  } finally {
    connection.release();
  }
});

export default router; 