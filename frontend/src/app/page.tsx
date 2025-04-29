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
  const [loadingProgress, setLoadingProgress] = useState(0);
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

  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [loading]);

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

      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-800 relative">
        {/* History button positioned absolutely on the right */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View History
          </button>
        </div>

        {/* Centered title and subtitle */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2">
            ROOMCRAFT<span className="text-blue-500">.AI</span>
          </h1>
          <p className="text-gray-400 text-lg tracking-wider">INTERIOR DESIGN | AI POWERED</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-97px)]">
        {/* Left Panel - Original Image and Controls */}
        <div className="w-96 border-r border-gray-800 p-6 flex flex-col">
          {/* Room Type Selection */}
          <div className="mb-6">
            <label 
              htmlFor="room-type-select" 
              className="block text-sm uppercase tracking-wider text-gray-400 mb-2"
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
          <div className="mb-6">
            <label 
              htmlFor="style-select" 
              className="block text-sm uppercase tracking-wider text-gray-400 mb-2"
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

          {/* Original Image Display */}
          <div className="flex-grow">
            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative h-72 rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Original room"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedImage(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/75 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Generate Button moved below image */}
                <button
                  onClick={generateDesigns}
                  disabled={!selectedFile || loading}
                  className={`w-full px-4 py-3 rounded-lg text-white font-medium text-lg transition-all duration-200
                    ${!selectedFile || loading
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    }`}
                >
                  {loading ? 'Processing...' : 'Generate Design'}
                </button>
              </div>
            ) : (
              <div className="h-72">
                <div className="h-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg hover:border-blue-500 transition-colors bg-gray-800/50">
                  <div className="space-y-2 text-center self-center">
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
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Generated Image */}
        <div className="flex-grow p-8 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              <p className="text-xl mb-8">Generating your design...</p>
              <div className="w-96 relative">
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="absolute right-0 top-4 text-sm text-gray-400">
                  {loadingProgress}%
                </div>
              </div>
            </div>
          ) : generatedImageUrl ? (
            <div className="h-full relative rounded-lg overflow-hidden">
              <Image
                src={generatedImageUrl}
                alt="Generated design"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p className="text-xl">Generated design will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* History Panel Overlay */}
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed inset-x-0 top-0 bg-gray-900 border-b border-gray-800 p-6 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Generation History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-800 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
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
                      className="bg-gray-800 rounded-lg overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 p-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Original</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-700">
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
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-700">
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
                      <div className="p-4 border-t border-gray-700">
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
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
}
