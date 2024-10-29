import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DragDropUploadProps {
  onFileUploaded: (fileName: string) => void;
}

export default function DragDropUpload({ onFileUploaded }: DragDropUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-audio-file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { fileName } = await response.json();
        onFileUploaded(fileName);
      }
    }
    setUploading(false);
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav'] },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-4 text-center cursor-pointer ${
        isDragActive ? 'border-amber-500 bg-amber-100' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop the audio files here...</p>
      ) : (
        <p>Drag 'n' drop some audio files here, or click to select files</p>
      )}
    </div>
  );
}