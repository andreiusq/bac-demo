'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  HelpCircle,
  CircleArrowUp,
  UserMinus,
  PowerOff,
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/ui/modal';
import { Document, Page, pdfjs } from 'react-pdf';
import PDFPreview from '@/components/PDFPreview';


// Setăm worker-ul pentru react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type User = {
  name: string;
  email: string;
};

type Centre = {
  id: string;
  name: string;
  edition: string;
  exam: string;
};

type Student = {
  id: string;
  lastName: string;
  fatherInitial: string;
  firstName: string;
  cnp: string;
  subject: string;
  hasWork: boolean;
  absent: boolean;
};

const probes = [
  { id: 'ea', label: 'E.a' },
  { id: 'ec', label: 'E.c' },
  { id: 'ed', label: 'E.d' },
];

const MIN_PAGES = 1;
const MAX_PAGES = 50;

export default function DashboardClient({
  user,
  centres,
}: {
  user: User;
  centres: Centre[];
}) {
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [selectedProbe, setSelectedProbe] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Modal upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadStudent, setUploadStudent] = useState<Student | null>(null);

  // Upload form states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [enteredPages, setEnteredPages] = useState<number | ''>('');
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCentre && selectedProbe) {
      setTimeout(() => {
        setStudents([
          {
            id: '1',
            lastName: 'Popescu',
            fatherInitial: 'M',
            firstName: 'Andrei',
            cnp: '1234567890123',
            subject: 'Matematică',
            hasWork: false,
            absent: false,
          },
          {
            id: '2',
            lastName: 'Ionescu',
            fatherInitial: 'A',
            firstName: 'Maria',
            cnp: '9876543210987',
            subject: 'Fizică',
            hasWork: true,
            absent: false,
          },
          {
            id: '3',
            lastName: 'Georgescu',
            fatherInitial: 'T',
            firstName: 'Ioana',
            cnp: '4567891234567',
            subject: 'Chimie',
            hasWork: false,
            absent: true,
          },
        ]);
      }, 500);
    } else {
      setStudents([]);
    }
  }, [selectedCentre, selectedProbe]);

  const handleChooseCentre = (centre: Centre) => {
    setSelectedCentre(centre);
    setSelectedProbe(null);
    setStudents([]);
  };

  const handleChooseProbe = (probeId: string) => {
    setSelectedProbe(probeId);
  };

  const openUploadModal = (student: Student) => {
    setUploadStudent(student);
    setUploadModalOpen(true);
    setPdfFile(null);
    setNumPages(null);
    setEnteredPages('');
    setPreviewMode(false);
    setError(null);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadStudent(null);
    setPdfFile(null);
    setNumPages(null);
    setEnteredPages('');
    setPreviewMode(false);
    setError(null);
  };

  const onPdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreviewMode(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Te rugăm să încarci doar fișiere PDF.');
        setPdfFile(null);
        return;
      }
      setPdfFile(file);
      setNumPages(null);
      setEnteredPages('');
    }
  };

  const handleEnteredPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setEnteredPages('');
      setError(null);
      return;
    }
    const num = Number(val);
    if (isNaN(num) || num < MIN_PAGES || num > MAX_PAGES) {
      setError(`Numărul de pagini trebuie să fie între ${MIN_PAGES} și ${MAX_PAGES}.`);
    } else {
      setError(null);
    }
    setEnteredPages(num);
  };

  const handlePreview = () => {
    if (!pdfFile) {
      setError('Te rugăm să selectezi un fișier PDF înainte de previzualizare.');
      return;
    }
    if (
      typeof enteredPages !== 'number' ||
      enteredPages < MIN_PAGES ||
      enteredPages > MAX_PAGES
    ) {
      setError(`Numărul de pagini trebuie să fie între ${MIN_PAGES} și ${MAX_PAGES}.`);
      return;
    }
    if (numPages && (enteredPages > numPages || enteredPages < numPages)) {
      // Dacă vrei să validezi că numărul introdus să fie fix egal cu numărul de pagini PDF-ului
      // poți comenta această condiție dacă e permis diferența
    }
    setError(null);
    setPreviewMode(true);
  };

  const handleAdd = () => {
    if (!pdfFile) {
      setError('Te rugăm să selectezi un fișier PDF.');
      return;
    }
    if (
      typeof enteredPages !== 'number' ||
      enteredPages < MIN_PAGES ||
      enteredPages > MAX_PAGES
    ) {
      setError(`Numărul de pagini trebuie să fie între ${MIN_PAGES} și ${MAX_PAGES}.`);
      return;
    }
    // Logica upload-ului aici (apel API, etc)
    alert(`Lucrarea pentru ${uploadStudent?.lastName} ${uploadStudent?.firstName} a fost încărcată cu succes!`);

    // Actualizează starea elevului că are lucrare
    setStudents((prev) =>
      prev.map((s) =>
        s.id === uploadStudent?.id ? { ...s, hasWork: true } : s
      )
    );

    closeUploadModal();
  };

  const handleToggleWork = (studentId: string) => {
    // acum deschide modalul
    const student = students.find((s) => s.id === studentId);
    if (student) {
      openUploadModal(student);
    }
  };

  const handleRemoveFromExam = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleMarkAbsent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, absent: true } : s
      )
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-6 space-y-6 shadow-xl">
        <div className="space-y-1">
          <div className="text-xl font-bold leading-none">{user.name}</div>
          <div className="text-sm text-slate-400">{user.email}</div>
          <div className="text-xs uppercase tracking-wider mt-4 text-slate-500">
            Ministerul Educației
          </div>
        </div>

        <div className="flex justify-center py-6">
          <div className="w-20 h-20 bg-white rounded-full shadow-md" />
        </div>

        <nav className="space-y-4">
          <Link
            href="#"
            className="flex items-center space-x-2 text-cyan-400 font-semibold hover:text-cyan-300"
          >
            <Building2 className="w-5 h-5" />
            <span>Centre</span>
          </Link>
          <Link
            href="#"
            className="flex items-center space-x-2 text-slate-300 hover:text-white"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Ajutor</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-slate-100">
        <div className="space-y-4">
          {/* Centre selection */}
          <div className="flex gap-2">
            {centres.map((centre) => (
              <button
                key={centre.id}
                onClick={() => handleChooseCentre(centre)}
                className={`px-4 py-2 rounded font-semibold border ${
                  selectedCentre?.id === centre.id
                    ? 'bg-cyan-400 text-white'
                    : 'border-cyan-400 text-cyan-400'
                }`}
              >
                {centre.name}
              </button>
            ))}
          </div>

          {/* Probe selection */}
          {selectedCentre && (
            <div className="flex gap-2">
              {probes.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handleChooseProbe(id)}
                  className={`px-4 py-2 rounded font-semibold border ${
                    selectedProbe === id
                      ? 'bg-cyan-400 text-white'
                      : 'border-cyan-400 text-cyan-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Students list */}
          {selectedProbe && (
            <Card>
              <CardContent>
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-300">
                      <th className="border border-slate-400 p-2 text-left">Nr.</th>
                      <th className="border border-slate-400 p-2 text-left">Nume</th>
                      <th className="border border-slate-400 p-2 text-left">Prenume</th>
                      <th className="border border-slate-400 p-2 text-left">CNP</th>
                      <th className="border border-slate-400 p-2 text-left">Disciplina</th>
                      <th className="border border-slate-400 p-2 text-center">Lucrare</th>
                      <th className="border border-slate-400 p-2 text-center">Eliminare</th>
                      <th className="border border-slate-400 p-2 text-center">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => (
                      <tr key={student.id} className={student.absent ? 'bg-red-100' : ''}>
                        <td className="border border-slate-400 p-2">{i + 1}</td>
                        <td className="border border-slate-400 p-2">{student.lastName}</td>
                        <td className="border border-slate-400 p-2">{student.firstName}</td>
                        <td className="border border-slate-400 p-2">{student.cnp}</td>
                        <td className="border border-slate-400 p-2">{student.subject}</td>
                        <td className="border border-slate-400 p-2 text-center">
                          <button
                            onClick={() => handleToggleWork(student.id)}
                            className="text-blue-600 hover:underline"
                          >
                            {student.hasWork ? 'Editează' : 'Încarcă'}
                          </button>
                        </td>
                        <td className="border border-slate-400 p-2 text-center">
                          <button
                            onClick={() => handleRemoveFromExam(student.id)}
                            className="text-red-600 hover:underline"
                          >
                            Elimină
                          </button>
                        </td>
                        <td className="border border-slate-400 p-2 text-center">
                          {!student.absent ? (
                            <button
                              onClick={() => handleMarkAbsent(student.id)}
                              className="text-orange-600 hover:underline"
                            >
                              Marchez absent
                            </button>
                          ) : (
                            <span className="text-red-700 font-semibold">Absent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upload Modal */}
        <Modal open={uploadModalOpen} onClose={closeUploadModal} title={`Încarcă lucrarea pentru ${uploadStudent?.lastName} ${uploadStudent?.firstName}`}>
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              min={MIN_PAGES}
              max={MAX_PAGES}
              placeholder={`Număr pagini (${MIN_PAGES}-${MAX_PAGES})`}
              value={enteredPages === '' ? '' : enteredPages}
              onChange={handleEnteredPagesChange}
              className="border p-2 rounded w-full"
            />

            {error && <div className="text-red-600 font-semibold">{error}</div>}

            <div className="flex justify-between">
              <Button onClick={handlePreview} disabled={!pdfFile}>
                Previzualizează PDF
              </Button>
              <Button
                onClick={handleAdd}
                disabled={
                  !pdfFile ||
                  typeof enteredPages !== 'number' ||
                  enteredPages < MIN_PAGES ||
                  enteredPages > MAX_PAGES
                }
              >
                Adaugă
              </Button>
            </div>

            {previewMode && pdfFile && (
  <PDFPreview
    file={pdfFile}
    setNumPages={setNumPages}
  />
)}

          </div>
        </Modal>
      </main>
    </div>
  );
}
