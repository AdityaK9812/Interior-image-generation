"use client";
import React, { useState, useRef, useEffect } from 'react';
import './Login.css';
import './globals.css';

function Login({ onLogin }: { onLogin: (success: boolean) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://interior-image-generation.onrender.com/api';
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'An error occurred');
      if (isRegistering) {
        setSuccess('Registration successful! Please login.');
        setIsRegistering(false);
        setUsername('');
        setPassword('');
      } else {
        onLogin(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <div className="login-box" style={{ background: '#18181b', color: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <h1 style={{ color: '#60a5fa', textAlign: 'center', fontWeight: 700, fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: 2 }}>ROOMCRAFT<span style={{ color: '#fff' }}>.AI</span></h1>
        <p style={{ textAlign: 'center', color: '#a3a3a3', marginBottom: '2rem', letterSpacing: 1 }}>INTERIOR DESIGN | AI POWERED</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{ background: '#23232a', color: '#fff', border: '1px solid #333' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ background: '#23232a', color: '#fff', border: '1px solid #333' }}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="login-button" style={{ background: '#2563eb', color: '#fff', fontWeight: 600 }}>
            {isRegistering ? 'Register' : 'Login'}
          </button>
          <button
            type="button"
            className="toggle-button"
            style={{ color: '#60a5fa', background: 'transparent', border: 'none', marginTop: 12, cursor: 'pointer' }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
          >
            {isRegistering ? 'Already have an account? Login' : 'New user? Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

const STYLE_OPTIONS = [
  { value: 'modern minimalist', label: 'Modern Minimalist' },
  { value: 'luxury classic', label: 'Luxury Classic' },
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'contemporary', label: 'Contemporary' }
];

const ROOM_TYPES = [
  { value: 'living room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'kitchen', label: 'Kitchen' }
];

interface Generation {
  id: number;
  originalImage: string;
  generatedImage: string;
  style: string;
  roomType: string;
  timestamp: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0].value);
  const [selectedRoomType, setSelectedRoomType] = useState(ROOM_TYPES[0].value);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Generation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 400);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoggedIn) {
    return <Login onLogin={setIsLoggedIn} />;
  }

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

  const handleRoomTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomType(event.target.value);
    setGeneratedDesign(null);
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://interior-image-generation.onrender.com/api';
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);
      formData.append('roomType', selectedRoomType);
      const response = await fetch(`${apiBase}/generate-designs`, {
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

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://interior-image-generation.onrender.com/api';
      const res = await fetch(`${apiBase}/generations`);
      const data: Generation[] = await res.json();
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top Border Line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      {/* Logout Button at top left */}
      <div style={{ position: 'fixed', top: 24, left: 24, zIndex: 50 }}>
        <button className="logout-btn w-full" style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
      </div>
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-800 relative">
        {/* History button positioned absolutely on the right */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <button
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
            onClick={() => { setShowHistory(true); fetchHistory(); }}
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
        {/* Left Panel - Room Type, Style, Upload */}
        <div className="w-96 border-r border-gray-800 p-6 flex flex-col relative">
          <div className="mb-6">
            <label htmlFor="room-type-select" className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Room Type</label>
            <select
              className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={selectedRoomType}
              onChange={handleRoomTypeChange}
            >
              {ROOM_TYPES.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="style-select" className="block text-sm uppercase tracking-wider text-gray-400 mb-2">Design Style</label>
            <select
              className="block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={selectedStyle}
              onChange={handleStyleChange}
            >
              {STYLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-grow">
            <div
              className="h-72 flex flex-col items-center justify-center border-2 border-gray-700 border-dashed rounded-lg bg-gray-800/50 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-60 rounded mb-4" />
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-400 mt-2">
                    <span className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300">Upload a file</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
            {selectedFile && previewUrl && (
              <button
                className="generate-btn mt-4 w-full"
                onClick={handleGenerateDesign}
                disabled={isLoading}
                style={{ background: '#2563eb', color: '#fff', fontWeight: 600, borderRadius: 6, padding: '0.75rem', fontSize: '1rem', marginTop: '1rem' }}
              >
                {isLoading ? 'Generating...' : 'Generate Design'}
              </button>
            )}
            {error && <div className="error-message mt-2">{error}</div>}
          </div>
        </div>
        {/* Main Content Area - Generated Image */}
        <div className="flex-grow p-8 relative flex items-center justify-center">
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-96 max-w-full mb-4">
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                </div>
                <div className="text-right text-xs text-gray-400 mt-1">{loadingProgress}%</div>
              </div>
              <div className="text-lg text-gray-300">Generating your design...</div>
            </div>
          ) : generatedDesign ? (
            <img src={generatedDesign} alt="Generated design" className="max-h-[600px] rounded shadow-lg" />
          ) : (
            <p className="text-xl text-gray-500">Generated design will appear here</p>
          )}
        </div>
      </div>
      {/* History Modal */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-black/80 z-40" onClick={() => setShowHistory(false)} />
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
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No generations found. Try generating some designs!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((generation) => (
                    <div
                      key={generation.id}
                      className="bg-gray-800 rounded-lg overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 p-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Original</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-700">
                            <img
                              src={generation.originalImage}
                              alt="Original room"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Generated</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-700">
                            <img
                              src={generation.generatedImage}
                              alt="Generated design"
                              className="object-cover w-full h-full"
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
    </main>
  );
}
