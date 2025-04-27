'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const STYLE_OPTIONS = [
  { value: 'modern minimalist', label: 'Modern Minimalist' },
  { value: 'luxury classic', label: 'Luxury Classic' },
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'contemporary', label: 'Contemporary' }
];

const ROOM_TYPES = [
  { value: 'living', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'kitchen', label: 'Kitchen' }
];

interface GenerationHistory {
  id: number;
  originalImage: string;
  generatedImage: string;
  style: string;
  roomType: string;
  timestamp: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0].value);
  const [selectedRoomType, setSelectedRoomType] = useState(ROOM_TYPES[0].value);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<{[key: string]: boolean}>({});
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(event.target.value);
  };

  const handleRoomTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomType(event.target.value);
  };

  useEffect(() => {
    // Fetch generation history when component mounts
    fetchGenerationHistory();
  }, []);

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [imageUrl]: true
    }));
    console.error(`Failed to load image: ${imageUrl}`);
  };

  const fetchGenerationHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generations', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGenerationHistory(data);
      // Reset image load errors when fetching new history
      setImageLoadErrors({});
    } catch (err) {
      console.error('Failed to fetch generation history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const generateDesigns = async () => {
    if (!selectedFile) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);
      formData.append('roomType', selectedRoomType);

      const response = await fetch('http://localhost:5000/api/generate-designs', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate designs');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.url);
      // Refresh history after new generation
      await fetchGenerationHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top Border Line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            ROOMCRAFT<span className="text-blue-500">.AI</span>
          </h1>
          <div className="flex justify-center items-center gap-12 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 mb-2 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest">Interior Design</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mb-2 mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest">AI Powered</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 backdrop-blur-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column - Controls */}
            <div className="space-y-8">
              {/* Room Type Selection */}
              <div>
                <label 
                  htmlFor="room-type-select" 
                  className="block text-sm uppercase tracking-wider text-gray-400 mb-3"
                >
                  Room Type
                </label>
                <select
                  id="room-type-select"
                  value={selectedRoomType}
                  onChange={handleRoomTypeChange}
                  className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  {ROOM_TYPES.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style Selection */}
              <div>
              <label 
                htmlFor="style-select" 
                  className="block text-sm uppercase tracking-wider text-gray-400 mb-3"
              >
                  Design Style
              </label>
              <select
                id="style-select"
                value={selectedStyle}
                onChange={handleStyleChange}
                  className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                {STYLE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
              <div>
                <label className="block text-sm uppercase tracking-wider text-gray-400 mb-3">
                  Room Photo
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg hover:border-blue-500 transition-colors bg-gray-800/50">
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-500"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
            <input
                          id="file-upload"
                          name="file-upload"
              type="file"
                          className="sr-only"
              accept="image/*"
              onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
            <button
              onClick={generateDesigns}
              disabled={!selectedFile || loading}
                className={`w-full px-6 py-4 rounded-lg text-white font-medium text-lg tracking-wide transition-all duration-200
                ${!selectedFile || loading
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Generate Design'
                )}
            </button>
          </div>

            {/* Right Column - Preview */}
            <div className="space-y-8">
              {selectedImage && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Original Room</h3>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={selectedImage}
                      alt="Uploaded space"
                      fill
                      className="object-cover"
                    />
        </div>
          </div>
        )}

        {generatedImageUrl && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Generated Design</h3>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={generatedImageUrl}
                alt="Generated design"
                fill
                      className="object-cover"
                unoptimized
              />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Toggle Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showHistory ? 'Hide Generation History' : 'Show Generation History'}
          </button>
        </div>

        {/* Generation History Section */}
        {showHistory && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-2xl font-bold mb-6">Generation History</h2>
            {isHistoryLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : generationHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No generations found. Try generating some designs!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generationHistory.map((generation) => (
                  <div
                    key={generation.id}
                    className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
                  >
                    <div className="grid grid-cols-2 gap-2 p-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Original</p>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                          <Image
                            src={generation.originalImage}
                            alt="Original room"
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => handleImageError(generation.originalImage)}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Generated</p>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                          <Image
                            src={generation.generatedImage}
                            alt="Generated design"
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => handleImageError(generation.generatedImage)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-800">
                      <p className="text-sm text-gray-400">
                        Style: <span className="text-white">{generation.style}</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Room Type: <span className="text-white">{generation.roomType}</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Generated: <span className="text-white">
                          {new Date(generation.timestamp).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
