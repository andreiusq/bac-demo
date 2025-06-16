const fs = require('fs');
const path = require('path');

// Get the path to the PDF.js worker file in node_modules
const workerPath = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/build/pdf.worker.min.js'
);

// Get the path to the public directory
const publicPath = path.join(__dirname, '../public');

// Create the public directory if it doesn't exist
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Copy the worker file to the public directory
fs.copyFileSync(workerPath, path.join(publicPath, 'pdf.worker.min.js'));

console.log('PDF.js worker file copied to public directory'); 