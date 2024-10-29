'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FileList from '@/components/FileList';
import DragDropUpload from '@/components/DragDropUpload';
import RecordAudio from '@/components/RecordAudio';

export default function EditSounds() {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);

  const fetchAudioFiles = useCallback(async () => {
    const response = await fetch('/api/get-audio-files');
    if (response.ok) {
      const files = await response.json();
      setAudioFiles(files);
    }
  }, []);

  useEffect(() => {
    fetchAudioFiles();
  }, [fetchAudioFiles]);

  const handleNewFile = (fileName: string) => {
    setAudioFiles(prev => [...prev, fileName]);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-500">edit sounds</h1>
          <Link href="/" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
            Back to Home
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <DragDropUpload onFileUploaded={handleNewFile} />
          <FileList files={audioFiles} onFileDeleted={fetchAudioFiles} />
          <RecordAudio onRecordingComplete={handleNewFile} existingFiles={audioFiles} />
        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import FileList from '@/components/FileList';
// import DragDropUpload from '@/components/DragDropUpload';
// import RecordAudio from '@/components/RecordAudio';

// export default function EditSounds() {
//   const [audioFiles, setAudioFiles] = useState<string[]>([]);

//   useEffect(() => {
//     // Fetch the list of audio files when the component mounts
//     fetchAudioFiles();
//   }, []);

//   const fetchAudioFiles = async () => {
//     const response = await fetch('/api/get-audio-files');
//     if (response.ok) {
//       const files = await response.json();
//       setAudioFiles(files);
//     }
//   };

//   const handleNewFile = (fileName: string) => {
//     setAudioFiles(prev => [...prev, fileName]);
//   };

//   return (
//     <div className="p-4 bg-amber-50 min-h-screen">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold text-amber-500">Edit Sounds</h1>
//         <Link href="/" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded">
//           Back to Home
//         </Link>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow">
//         <DragDropUpload onFileUploaded={handleNewFile} />
//         <FileList files={audioFiles} onFileDeleted={fetchAudioFiles} />
//         <RecordAudio onRecordingComplete={handleNewFile} existingFiles={audioFiles} />
//       </div>
//     </div>
//   );
// }