import { pdfjs } from 'react-pdf';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  // Use the worker file from node_modules
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
} 