'use client'; 

import { useState } from 'react';
import { FileUploadForm } from '@/components/file-upload-form';
import { ProgressBar } from '@/components/progress-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeroSection from '@/components/hero';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [zipFileUrl, setZipFileUrl] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (isProcessing) return;  // Prevent duplicate submissions
    setIsProcessing(true);
    setErrorMessage(null);
    setZipFileUrl(null);
  
    try {
      console.log('Uploading file to server...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }
  
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Received empty ZIP file.');
  
      const zipUrl = window.URL.createObjectURL(blob);
      setZipFileUrl(zipUrl);
      console.log('Download URL ready:', zipUrl);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage('Failed to process the file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  

  const handleDownloadClick = () => {
    if (zipFileUrl) {
      const a = document.createElement('a');
      a.href = zipFileUrl;
      a.download = 'filtered_chunks.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log('ZIP file downloaded successfully.');
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-8">
      <HeroSection />

      <Card className="w-full max-w-2xl border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Generate Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadForm onSubmit={handleSubmit} />

          {isProcessing && <ProgressBar value={progress} label="Processing file..." />}

          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          {zipFileUrl && (
            <div className="text-center mt-4">
              <Button onClick={handleDownloadClick} className="bg-blue-600 text-white px-4 py-2 rounded">
                Download ZIP File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
