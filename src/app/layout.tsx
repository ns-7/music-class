import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Music Genre Classifier',
  description: 'Analyze music tracks to determine their genre using machine learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
