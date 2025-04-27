import React, { useState, useRef } from 'react';
import './App.css';

const STYLE_OPTIONS = [
  { value: 'modern minimalist', label: 'Modern Minimalist' },
  { value: 'luxury classic', label: 'Luxury Classic' },
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'contemporary', label: 'Contemporary' }
];

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0].value);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setGeneratedDesign(null); // Clear previous design
      setError(null);
    }
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(event.target.value);
    setGeneratedDesign(null); // Clear previous design when style changes
    setError(null);
  };

  const handleGenerateDesign = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);

      const response = await fetch('http://localhost:5000/api/generate-designs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate design');
      }

      const data = await response.json();
      setGeneratedDesign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Interior Design Generator</h1>
      
      <div className="style-selection">
        <label htmlFor="style-select">Choose Interior Design Style</label>
        <select 
          id="style-select"
          value={selectedStyle} 
          onChange={handleStyleChange}
        >
          {STYLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button 
          className="choose-file-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose file
        </button>
        {selectedFile && <span className="file-name">{selectedFile.name}</span>}
      </div>

      {previewUrl && (
        <>
          <div className="preview-image">
            <img src={previewUrl} alt="Preview" />
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerateDesign}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Design'}
          </button>
        </>
      )}

      {error && <div className="error-message">{error}</div>}

      {generatedDesign && (
        <div className="generated-design">
          <h2>Generated Design</h2>
          <img src={generatedDesign} alt="Generated design" />
        </div>
      )}
    </div>
  );
}

export default App; 