"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  id: number;
  student_name: string;
  exam_title: string;
  subject_name: string;
  submitted_at: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions/for-grading');
      if (!response.ok) throw new Error('Eroare la încărcarea lucrărilor');
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (submissionId: number) => {
    router.push(`/teacher/submissions/${submissionId}/grade`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lucrări de Corectat</h1>

      {submissions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nu există lucrări în așteptare pentru corectare.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {submission.exam_title}
                  </h2>
                  <p className="text-gray-600 mb-1">
                    Student: {submission.student_name}
                  </p>
                  <p className="text-gray-600 mb-1">
                    Materie: {submission.subject_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Încărcat la: {new Date(submission.submitted_at).toLocaleString('ro-RO')}
                  </p>
                </div>
                <button
                  onClick={() => handleGradeClick(submission.id)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Corectează
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 