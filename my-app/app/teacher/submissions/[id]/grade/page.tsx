"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import GradingInterface from '@/components/GradingInterface';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function GradeSubmissionPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const submissionId = parseInt(resolvedParams.id);

  const handleGradeSubmitted = () => {
    router.push('/teacher/submissions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-500 hover:text-blue-600 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Înapoi la lista de lucrări
        </button>

        <GradingInterface
          submissionId={submissionId}
          onGradeSubmitted={handleGradeSubmitted}
        />
      </div>
    </div>
  );
} 