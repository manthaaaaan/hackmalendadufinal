import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

export const DropZone = ({ onDataParsed }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const processFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setErrorMsg("Please upload a valid .csv file.");
      setSuccessMsg("");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        if (data && data.length > 0) {
          // Auto-detect the column containing the longest text by scanning the first 10 rows
          const sampleRows = data.slice(0, 10);
          let bestColumn = null;
          let maxTotalLength = -1;
          
          const columns = Object.keys(data[0]);
          columns.forEach(key => {
              let totalLength = 0;
              sampleRows.forEach(row => {
                  if (row[key] && typeof row[key] === 'string') {
                      totalLength += row[key].length;
                  }
              });
              
              if (totalLength > maxTotalLength) {
                  maxTotalLength = totalLength;
                  bestColumn = key;
              }
          });
          
          if (!bestColumn) {
             setErrorMsg("Could not find any readable text in the CSV.");
             setSuccessMsg("");
             return;
          }
          
          // Normalize data so pipeline.js can easily find the text
          const locationColumn = columns.find(c => /location|city|country|region/i.test(c));
          
          const normalizedData = data.map(row => ({
              ...row,
              review_text: row[bestColumn] || "",
              reported_location: locationColumn ? row[locationColumn] : null
          }));

          setSuccessMsg(`✓ ${normalizedData.length} reviews loaded from ${file.name}`);
          setErrorMsg("");
          if (onDataParsed) onDataParsed(normalizedData);
        } else {
          setErrorMsg("CSV appears to be empty.");
          setSuccessMsg("");
        }
      },
      error: (err) => {
        setErrorMsg(`Error parsing CSV: ${err.message}`);
        setSuccessMsg("");
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full aspect-[21/9] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 
          border-2 border-dashed
          ${isDragActive ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-primary hover:bg-brand-primary/5 bg-brand-card'}
        `}
      >
        <Upload className={`w-12 h-12 mb-4 ${isDragActive ? 'text-brand-primary scale-110' : 'text-brand-primary'} transition-transform duration-200`} />
        <span className="text-white text-xl font-bold">Drop your CSV here</span>
        <span className="text-brand-textSecondary text-sm mt-2">or click to browse</span>
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>

      {successMsg && (
         <p className="text-brand-success text-sm font-semibold mt-4 bg-brand-success/10 px-4 py-2 rounded-lg">
            {successMsg}
         </p>
      )}
      {errorMsg && (
         <p className="text-brand-error text-sm font-semibold mt-4 bg-brand-error/10 px-4 py-2 rounded-lg">
            {errorMsg}
         </p>
      )}
    </div>
  );
};
