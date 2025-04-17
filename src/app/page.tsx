"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to music classifier page
    router.push('/music-classifier');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Music Genre Classifier</h1>
        <p className="mb-6">Redirecting to the classifier...</p>
      </div>
    </div>
  );
}
