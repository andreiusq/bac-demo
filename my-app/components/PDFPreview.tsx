'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFPreviewProps {
  file: File;
  setNumPages: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function PDFPreview({ file, setNumPages }: PDFPreviewProps) {
  const [localNumPages, setLocalNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setLocalNumPages(numPages);
    setNumPages(numPages);
  };

  return (
    <div className="relative z-20">
    <div className="relative">
        <Document
        file={file}
        onLoadSuccess={handleDocumentLoadSuccess}
        className="w-full"
        >
        <div className="relative">
            <div className="absolute z-30 pointer-events-none select-none text-[120px] text-black-300 font-bold opacity-40 rotate-[-30deg] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            DRAFT
            </div>

            <Page
            pageNumber={pageNumber}
            width={750}
            renderAnnotationLayer
            renderTextLayer
            className="shadow-lg rounded-lg center"
            />
        </div>
        </Document>
    </div>

      {localNumPages && (
        <div className="flex items-center gap-2 mt-6 z-20">
          <button
            onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            ◀ Pagina anterioară
          </button>
          <span className="text-sm text-gray-600">
            Pagina {pageNumber} din {localNumPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(p + 1, localNumPages))}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Pagina următoare ▶
          </button>
        </div>
      )}
    </div>
  );
}
