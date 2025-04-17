export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Music Genre Classifier</title>
        <meta name="description" content="Analyze music tracks to determine their genre using machine learning" />
      </head>
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
