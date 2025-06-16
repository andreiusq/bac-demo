import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { motion } from 'framer-motion';
import { validateScores, calculateTotalScore } from '@/utils/rubricValidation';
import '@/lib/pdfjs-config';

interface Submission {
  id: number;
  student_name: string;
  exam_title: string;
  subject_name: string;
  file_path: string;
  status: 'pending' | 'graded' | 'reviewed';
  initial_grade?: {
    score: number;
    feedback: string;
    detailed_scores: any;
    graded_by: string;
    graded_at: string;
  };
}

interface GradingInterfaceProps {
  submissionId: number;
  onGradeSubmitted: () => void;
  isReview?: boolean;
}

const GradingInterface: React.FC<GradingInterfaceProps> = ({ 
  submissionId, 
  onGradeSubmitted,
  isReview = false 
}) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Grading state
  const [scores, setScores] = useState({
    subiect1A: {
      item1: 0,
      item2: 0,
      item3: 0,
      item4: 0,
      item5: 0,
    },
    subiect1B: {
      opinie: 0,
      argumente: 0,
      dezvoltare: 0,
      valorificare: 0,
      concluzie: 0,
      conectori: 0,
      limbaj: 0,
      ortografie: 0,
      formatare: 0,
      cuvinte: 0,
    },
    subiect2: {
      continut: 0,
      redactare: 0,
    },
    subiect3: {
      personaje: 0,
      relatii: 0,
      analiza: 0,
      redactare: 0,
    }
  });

  const [feedback, setFeedback] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      if (!response.ok) throw new Error('Eroare la încărcarea lucrării');
      const data = await response.json();
      setSubmission(data);
      
      if (isReview && data.initial_grade) {
        setScores(data.initial_grade.detailed_scores);
        setFeedback(data.initial_grade.feedback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (section: string, key: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [key]: value }
    }));

    // Validate scores after change
    const newScores = {
      ...scores,
      [section]: { ...scores[section as keyof typeof scores], [key]: value }
    };
    const { errors } = validateScores(newScores);
    setValidationErrors(errors);
  };

  const handleGradeSubmit = async () => {
    const { isValid, errors } = validateScores(scores);
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    try {
      const totalScore = calculateTotalScore(scores);
      const endpoint = isReview 
        ? `/api/submissions/${submissionId}/review`
        : `/api/submissions/${submissionId}/grade`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: totalScore,
          feedback,
          detailedScores: scores,
          reviewNotes: isReview ? reviewNotes : undefined
        })
      });

      if (!response.ok) throw new Error('Eroare la trimiterea notei');
      onGradeSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la trimiterea notei');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>;

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  if (!submission) return <div className="text-center p-4">Lucrarea nu a fost găsită</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* PDF Viewer */}
      <div className="w-1/2 p-4 overflow-auto">
        <Document
          file={submission.file_path}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex flex-col items-center"
        >
          <Page 
            pageNumber={currentPage} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-700">
            Pagina {currentPage} din {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Următor
          </button>
        </div>
      </div>

      {/* Grading Interface */}
      <div className="w-1/2 p-4 overflow-auto bg-white">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {isReview ? 'Verificare Notă' : 'Corectare Lucrare'}
        </h2>
        
        {isReview && submission.initial_grade && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-900">Notă inițială</h3>
            <p className="text-gray-700">Corector: {submission.initial_grade.graded_by}</p>
            <p className="text-gray-700">Data: {new Date(submission.initial_grade.graded_at).toLocaleString('ro-RO')}</p>
            <p className="text-gray-700">Punctaj: {submission.initial_grade.score}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="font-semibold text-gray-900">Student: {submission.student_name}</p>
          <p className="text-gray-700">Subiect: {submission.exam_title}</p>
          <p className="text-gray-700">Materie: {submission.subject_name}</p>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <h3 className="font-semibold mb-2">Erori de validare:</h3>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Subiectul I */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-black">Subiectul I (50 puncte)</h3>
          
          {/* Subiectul I.A */}
          <div className="mb-4">
            <h4 className="font-semibold">A. (30 puncte)</h4>
            {Object.entries(scores.subiect1A).map(([key, value]) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Item {key.replace('item', '')} (6 puncte)
                </label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={value}
                  onChange={(e) => handleScoreChange('subiect1A', key, parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Subiectul I.B */}
          <div className="mb-4">
            <h4 className="font-semibold text-black">B. (20 puncte)</h4>
            {Object.entries(scores.subiect1B).map(([key, value]) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  min="0"
                  max={key === 'conectori' ? 2 : 1}
                  value={value}
                  onChange={(e) => handleScoreChange('subiect1B', key, parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Subiectul II */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Subiectul II (10 puncte)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conținut (6 puncte)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={scores.subiect2.continut}
                onChange={(e) => handleScoreChange('subiect2', 'continut', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Redactare (4 puncte)
              </label>
              <input
                type="number"
                min="0"
                max="4"
                value={scores.subiect2.redactare}
                onChange={(e) => handleScoreChange('subiect2', 'redactare', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Subiectul III */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Subiectul III (30 puncte)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personaje (6 puncte)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={scores.subiect3.personaje}
                onChange={(e) => handleScoreChange('subiect3', 'personaje', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Relații (6 puncte)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={scores.subiect3.relatii}
                onChange={(e) => handleScoreChange('subiect3', 'relatii', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Analiză (6 puncte)
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={scores.subiect3.analiza}
                onChange={(e) => handleScoreChange('subiect3', 'analiza', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Redactare (12 puncte)
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={scores.subiect3.redactare}
                onChange={(e) => handleScoreChange('subiect3', 'redactare', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isReview ? 'Observații pentru corector' : 'Observații și feedback'}
          </label>
          <textarea
            value={isReview ? reviewNotes : feedback}
            onChange={(e) => isReview ? setReviewNotes(e.target.value) : setFeedback(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={isReview 
              ? "Introduceți observațiile pentru corector..."
              : "Introduceți observațiile și feedback-ul pentru student..."
            }
          />
        </div>

        {/* Total Score */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Punctaj Total</h3>
          <p className="text-2xl font-bold">
            {calculateTotalScore(scores)} puncte
          </p>
          <p className="text-sm text-gray-600">
            Nota finală: {(calculateTotalScore(scores) / 10).toFixed(1)}
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGradeSubmit}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            {isReview ? 'Trimite Verificarea' : 'Trimite Nota'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradingInterface; 