// Modal to upload a file and trigger backend processing.

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { GraphData } from '../../types';

interface PDFUploaderProps {
  darkMode: boolean;
  onClose: () => void;
  onFileProcessed: (parsedData: GraphData) => void; // Callback when backend returns data
  onTriggerAgent: (action: string, payload?: any) => void; // To communicate with AgentConsole
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ darkMode, onClose, onFileProcessed, onTriggerAgent }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic validation
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.md')) {
        setFile(selectedFile);
        setStatus('idle');
        setStatusMessage('');
      } else {
        setStatus('error');
        setStatusMessage('Please upload a PDF, text (.txt), or Markdown (.md) file.');
      }
    }
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
       if (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.md')) {
        setFile(droppedFile);
        setStatus('idle');
        setStatusMessage('');
      } else {
        setStatus('error');
        setStatusMessage('Please upload a PDF, text (.txt), or Markdown (.md) file.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async () => {
    if (!file) return;

    setStatus('uploading');
    setStatusMessage(`Uploading "${file.name}"...`);

    // --- Simulate backend processing ---
    onTriggerAgent('add-message', {
        id: `upload_start_${Date.now()}`,
        sourceAgent: 'Nexus Weaver',
        type: 'info',
        content: `Received file "${file.name}". Initiating processing pipeline...`,
        timestamp: Date.now(),
    });

    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
     setStatus('processing');
    setStatusMessage('Processing file and extracting concepts...');

     onTriggerAgent('add-message', {
        id: `process_start_${Date.now()}`,
        sourceAgent: 'Nexus Weaver',
        type: 'info',
        content: `Processing "${file.name}". This may take some time...`,
        timestamp: Date.now(),
    });


    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for processing


    // Simulate parsing result (mock data for now)
    // In a real app, this data comes from the backend
    const mockParsedData: GraphData = {
      nodes: [
        { id: 'Extracted Concept A', type: 'Concept', group: 6, value: 5, description: 'Simulated concept from upload', references: ['simulated_ref_2024'] },
        { id: 'Extracted Material B', type: 'Material', group: 1, value: 3, description: 'Simulated material from upload', references: ['simulated_ref_2024'] },
        { id: 'Extracted Mechanism C', type: 'Mechanism', group: 2, value: 4, description: 'Simulated mechanism from upload', references: ['simulated_ref_2024'] },
         { id: 'simulated_ref_2024', type: 'Paper', group: 4, description: 'Simulated reference paper', references: []} // Add reference node
      ],
      links: [
        { source: 'Extracted Concept A', target: 'Extracted Material B', type: 'uses-material', value: 2 },
        { source: 'Extracted Concept A', target: 'Extracted Mechanism C', type: 'uses-mechanism', value: 1 },
         { source: 'Extracted Concept A', target: 'simulated_ref_2024', type: 'cites-paper', value: 1 }, // Link concept to paper
         { source: 'Extracted Material B', target: 'simulated_ref_2024', type: 'cites-paper', value: 1 }, // Link material to paper
         { source: 'Extracted Mechanism C', target: 'simulated_ref_2024', type: 'cites-paper', value: 1 }, // Link mechanism to paper
      ]
    };

     setStatus('success');
    setStatusMessage('File processed successfully! Extracted data is ready for integration.');

     onTriggerAgent('add-message', {
        id: `process_success_${Date.now()}`,
        sourceAgent: 'Nexus Weaver',
        type: 'info',
        content: `Successfully processed "${file.name}". Found ${mockParsedData.nodes.length} nodes and ${mockParsedData.links.length} links. Ready to add to graph.`,
        timestamp: Date.now(),
         action: { type: 'integrate-data', payload: mockParsedData } // Action to integrate the data
    });


    onFileProcessed(mockParsedData); // Pass data back to App

  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
      <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload File for Analysis</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'} ${file ? 'bg-opacity-50' : ''} ${
              status === 'processing' || status === 'uploading' ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-100/50') : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.md" // Accept common text/markdown/pdf
            className="hidden"
          />

          {!file ? (
            <div>
              <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="mb-2">Drag and drop your PDF, TXT, or MD file here, or</p>
              <button
                onClick={handleSelectFile}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              >
                Select File
              </button>
            </div>
          ) : (
            <div>
              <FileText className="mx-auto h-8 w-8 mb-2 text-blue-500" />
              <p className="mb-1 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

              {status === 'uploading' || status === 'processing' ? (
                 <div className={`flex items-center justify-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Loader size={18} className="animate-spin mr-2" />
                    <span>{statusMessage}</span>
                 </div>
              ) : status === 'success' ? (
                <div className="flex items-center justify-center text-green-500">
                  <CheckCircle size={18} className="mr-2" />
                  <span>{statusMessage}</span>
                </div>
              ) : status === 'error' ? (
                <div className="flex items-center justify-center text-red-500">
                  <AlertCircle size={18} className="mr-2" />
                  <span>{statusMessage}</span>
                </div>
              ) : (
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={handleSelectFile}
                    className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  >
                    Change
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`px-3 py-1 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                    disabled={status === 'uploading' || status === 'processing'}
                  >
                    Process
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Process Steps (Simulated Backend)</h3>
          <ul className="text-sm space-y-1">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Upload & Pre-process Document</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Extract Structured Knowledge (Concepts, Attributes, Relations)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Validate & Integrate with Existing Knowledge Graph</span>
            </li>
             <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Report Findings & Opportunities via Agent Console</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;