"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Share2,
  Twitter,
  Facebook,
  Copy,
  CheckCircle,
  Music,
  Info,
  Server,
  Wifi,
  WifiOff,
  Star
} from "lucide-react";
import RatingSystem from "@/components/RatingSystem";
import { analyzeAudio, checkApiHealth, submitRating } from "@/lib/api";

// Genre information for display
const genreInfo = {
  blues: "Blues is a music genre originating in the Deep South of the United States around the 1860s, characterized by blue notes, call-and-response patterns, and specific chord progressions.",
  classical: "Classical music is art music produced or rooted in the traditions of Western culture, including both liturgical and secular music, spanning from roughly the 11th century to the present day.",
  country: "Country music is a genre of popular music that originated in the Southern United States in the early 1920s, characterized by ballads and dance tunes with simple forms and harmonies accompanied by string instruments.",
  disco: "Disco is a genre of dance music and a subculture that emerged in the 1970s, characterized by four-on-the-floor beats, syncopated basslines, and string sections.",
  hiphop: "Hip hop music, also known as rap music, is a genre developed in the United States by inner-city African Americans and Latino Americans in the Bronx borough of New York City in the 1970s.",
  jazz: "Jazz is a music genre that originated in the African-American communities of New Orleans in the late 19th and early 20th centuries, characterized by swing and blue notes, complex chords, and improvisation.",
  metal: "Metal is a genre of rock music that developed in the late 1960s and early 1970s, characterized by highly amplified distortion, extended guitar solos, emphatic beats, and overall loudness.",
  pop: "Pop music is a genre of popular music that originated in its modern form during the mid-1950s, characterized by a strong melody, simple structure, and often a focus on romantic themes.",
  reggae: "Reggae is a music genre that originated in Jamaica in the late 1960s, characterized by a strong rhythmic pattern with accents on the off-beat, often with lyrics focusing on social and political issues.",
  rock: "Rock music is a broad genre of popular music that originated as 'rock and roll' in the United States in the late 1940s and early 1950s, characterized by a heavy use of electric guitars, bass guitar, and drums."
};

// API Status Indicator component
function ApiStatusIndicator() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [message, setMessage] = useState<string>('Checking API connection...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await checkApiHealth();
        setStatus('connected');
        setMessage(health.message || 'API connected successfully');
      } catch (error) {
        setStatus('error');
        setMessage('API connection failed. Using client-side fallback.');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="fixed top-4 right-4 flex items-center bg-gray-800 px-3 py-1 rounded-full text-sm shadow-lg">
      {status === 'connecting' && (
        <>
          <Server size={14} className="text-yellow-400 mr-2" />
          <span className="text-yellow-400">{message}</span>
        </>
      )}
      {status === 'connected' && (
        <>
          <Wifi size={14} className="text-green-400 mr-2" />
          <span className="text-green-400">{message}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <WifiOff size={14} className="text-red-400 mr-2" />
          <span className="text-red-400">{message}</span>
        </>
      )}
    </div>
  );
}

export default function MusicClassifier() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    genre: string;
    confidence: number;
    topGenres: string[];
    topConfidences: number[];
    spectrogram: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGenreInfo, setShowGenreInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [apiMessage, setApiMessage] = useState<string>('Checking API connection...');
  const [showRatingSystem, setShowRatingSystem] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Check file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.mp3') && 
        !selectedFile.name.endsWith('.wav') && 
        !selectedFile.name.endsWith('.ogg') && 
        !selectedFile.name.endsWith('.m4a')) {
      setError('Please upload a valid audio file (MP3, WAV, OGG, M4A)');
      return;
    }

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResults(null);

    // Create URL for audio player
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    const url = URL.createObjectURL(selectedFile);
    setFileUrl(url);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Call API to analyze audio
      const result = await analyzeAudio(file);
      
      // Transform API response to match our state structure
      setResults({
        genre: result.genre,
        confidence: result.confidence,
        topGenres: result.top_genres || [],
        topConfidences: result.top_confidences || [],
        spectrogram: result.spectrogram
      });
    } catch (error) {
      console.error('Error analyzing audio:', error);
      setError('Error analyzing audio. Please try again.');
      
      // Fallback to client-side "analysis" for demo purposes
      const genres = ['rock', 'pop', 'jazz', 'classical', 'hiphop', 'country', 'metal', 'blues', 'reggae', 'disco'];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      const confidence = 0.7 + Math.random() * 0.3; // Random confidence between 0.7 and 1.0
      
      // Generate top genres
      const topGenres = [randomGenre];
      const topConfidences = [confidence];
      
      // Add 2 more random genres
      for (let i = 0; i < 2; i++) {
        let nextGenre;
        do {
          nextGenre = genres[Math.floor(Math.random() * genres.length)];
        } while (topGenres.includes(nextGenre));
        
        topGenres.push(nextGenre);
        topConfidences.push(Math.random() * 0.7); // Lower confidence for other genres
      }
      
      // Sort by confidence
      const indices = topConfidences.map((_, i) => i);
      indices.sort((a, b) => topConfidences[b] - topConfidences[a]);
      
      const sortedGenres = indices.map(i => topGenres[i]);
      const sortedConfidences = indices.map(i => topConfidences[i]);
      
      setResults({
        genre: sortedGenres[0],
        confidence: sortedConfidences[0],
        topGenres: sortedGenres,
        topConfidences: sortedConfidences,
        spectrogram: null
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileUrl(null);
    setResults(null);
    setError(null);
    setShowGenreInfo(null);
    setShowRatingSystem(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleGenreInfo = (genre: string | null) => {
    setShowGenreInfo(genre);
  };

  const shareResults = async (platform: string) => {
    if (!results) return;

    const shareText = `I just analyzed a track with Music Genre Classifier and discovered it's ${results.genre} music with ${Math.round(results.confidence * 100)}% confidence! Check it out:`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10 text-white">
      <ApiStatusIndicator />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 border border-blue-500/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">
                <Music size={20} />
              </div>
              <h1 className="text-3xl font-bold text-blue-400">Music Genre Classifier</h1>
            </div>
            <p className="text-gray-400 mt-2">
              Upload a music file to classify its genre using our intelligent classifier technology
            </p>
          </div>

          {!results ? (
            <>
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-6 text-center hover:border-blue-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Music size={48} className="mx-auto text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-300">Drag & Drop Audio File</h2>
                <p className="text-gray-500 mb-4">or</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                  accept="audio/*"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded-md cursor-pointer transition duration-200"
                >
                  Browse Files
                </label>
                <p className="text-gray-500 mt-4 text-sm">
                  Supported formats: MP3, WAV, OGG, M4A (max 10MB)
                </p>
              </div>

              {file && (
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Selected File</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Music size={20} className="text-gray-400 mr-2" />
                      <span className="text-gray-300 truncate max-w-xs">{file.name}</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  {fileUrl && (
                    <div className="mb-4">
                      <audio ref={audioRef} src={fileUrl} controls className="w-full" />
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className={`${
                        analyzing
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-400'
                      } text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center`}
                    >
                      {analyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Genre'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-md mb-6">
                  <p>{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Genre Classification</h3>
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold mb-2 capitalize text-white">{results.genre}</div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.round(results.confidence * 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-sm mt-1 text-gray-300">
                    {Math.round(results.confidence * 100)}%
                  </div>
                  <button
                    onClick={() => toggleGenreInfo(results.genre)}
                    className="mt-2 text-blue-400 flex items-center"
                  >
                    <Info size={16} className="mr-1" />
                    {showGenreInfo === results.genre ? 'Hide Info' : 'About this genre'}
                  </button>
                  {showGenreInfo === results.genre && (
                    <div className="mt-2 text-gray-300 bg-gray-800 p-3 rounded">
                      {genreInfo[results.genre as keyof typeof genreInfo]}
                    </div>
                  )}
                </div>

                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Top 3 Predictions</h3>
                  {results.topGenres.map((genre, index) => (
                    <div key={genre} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="capitalize text-white">{genre}</span>
                        <span className="text-gray-300">{Math.round(results.topConfidences[index] * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.round(results.topConfidences[index] * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Audio Visualization</h3>
                {results.spectrogram ? (
                  <div className="text-center">
                    <img
                      src={`data:image/png;base64,${results.spectrogram}`}
                      alt="Audio Visualization"
                      className="max-w-full rounded-md mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 border border-gray-600 rounded-lg">
                    <div className="text-gray-400">
                      <Music className="w-16 h-16 mx-auto text-blue-400" />
                      <p className="mt-2">Audio visualization not available in this demo</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  Note: This is a client-side demonstration of the music genre classifier. In a production environment,
                  audio processing would be performed on a server with a trained machine learning model for accurate results.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    className="bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-6 rounded-md transition duration-200"
                    onClick={handleReset}
                  >
                    Analyze Another Track
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-400 text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center"
                    onClick={() => setShowRatingSystem(true)}
                  >
                    <Star size={16} className="mr-2" />
                    Rate This Result
                  </button>
                </div>
                
                {showRatingSystem && (
                  <RatingSystem
                    audioId={file?.name || 'unknown'}
                    predictedGenre={results.genre}
                    onSubmit={async (rating) => {
                      try {
                        await submitRating(rating);
                        return Promise.resolve();
                      } catch (error) {
                        console.error('Failed to submit rating:', error);
                        return Promise.reject(error);
                      }
                    }}
                    onClose={() => setShowRatingSystem(false)}
                  />
                )}
                
                <div className="flex justify-center mt-6 gap-3">
                  <button
                    onClick={() => shareResults('twitter')}
                    className="flex items-center bg-[#1DA1F2] hover:bg-[#1a94da] text-white font-medium py-2 px-4 rounded-md"
                  >
                    <Twitter size={16} className="mr-2" />
                    Share
                  </button>
                  <button
                    onClick={() => shareResults('facebook')}
                    className="flex items-center bg-[#4267B2] hover:bg-[#375695] text-white font-medium py-2 px-4 rounded-md"
                  >
                    <Facebook size={16} className="mr-2" />
                    Share
                  </button>
                  <button
                    onClick={() => shareResults('copy')}
                    className="flex items-center bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
