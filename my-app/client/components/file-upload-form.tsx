'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface FileUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

export function FileUploadForm({ onSubmit }: FileUploadFormProps) {
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [writeLikeFile, setWriteLikeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zipFileUrl, setZipFileUrl] = useState<string | null>(null);

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContentFile(e.target.files[0]);
      setErrorMessage(null); // Clear previous errors on file selection
    }
  };

  const handleWriteLikeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWriteLikeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contentFile) {
      setErrorMessage('Please select a content file.');
      return;
    }

    const formData = new FormData();
    formData.append('contentFile', contentFile);
    if (writeLikeFile) {
      formData.append('writeLikeFile', writeLikeFile);
    }

    setIsUploading(true);
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

      // Convert response to blob
      const blob = await response.blob();
      console.log('Blob received:', blob);

      if (blob.size === 0) {
        throw new Error('Received empty ZIP file.');
      }

      // Store the ZIP file URL for later download
      const url = window.URL.createObjectURL(blob);
      console.log('ZIP file URL ready:', url);
      setZipFileUrl(url);
      setErrorMessage(null); // Ensure error is cleared after successful upload

    } catch (error) {
      setErrorMessage('An error occurred while uploading the file.');
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content-file-upload">Content File</Label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 transition-colors hover:border-primary/50">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <Input
              id="content-file-upload"
              type="file"
              accept=".txt"
              onChange={handleContentFileChange}
              className="hidden"
            />
            <label
              htmlFor="content-file-upload"
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer text-center"
            >
              {contentFile ? contentFile.name : 'Choose a .txt file'}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="write-like-file-upload">"Write Like" File (Optional)</Label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 transition-colors hover:border-primary/50">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <Input
              id="write-like-file-upload"
              type="file"
              accept=".txt"
              onChange={handleWriteLikeFileChange}
              className="hidden"
            />
            <label
              htmlFor="write-like-file-upload"
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer text-center"
            >
              {writeLikeFile ? writeLikeFile.name : 'Choose a "write like" file'}
            </label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={!contentFile || isUploading} className="w-full">
        {isUploading ? 'Processing...' : 'Generate Posts'}
      </Button>

      {zipFileUrl && (
        <div className="text-center mt-4">
          <Button
            onClick={handleDownloadClick}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download ZIP File
          </Button>
        </div>
      )}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </form>
  );
}
