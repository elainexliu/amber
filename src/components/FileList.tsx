import { useState, useRef, useEffect } from 'react';

interface FileListProps {
  files: string[];
  onFileDeleted: () => void;
}

export default function FileList({ files, onFileDeleted }: FileListProps) {
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<string[]>(files);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLocalFiles(files);
  }, [files]);

  useEffect(() => {
    return () => {
      // Cleanup: stop audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handlePlayStop = (file: string) => {
    if (playingFile === file) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingFile(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(`/alerts/${file}`);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingFile(null);
      setPlayingFile(file);
    }
  };

  const handleDelete = async (file: string) => {
    if (playingFile === file && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingFile(null);
    }
    try {
      const response = await fetch(`/api/delete-audio-file?file=${encodeURIComponent(file)}`, { method: 'DELETE' });
      if (response.ok) {
        setLocalFiles(prevFiles => prevFiles.filter(f => f !== file));
        onFileDeleted();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete file:', errorData.error);
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Optionally, show an error message to the user
    }
  };
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Current Sound Files</h2>
      <ul>
        {localFiles.map(file => (
          <li 
            key={file} 
            className="flex items-center justify-between py-2 border-b hover:bg-amber-50 transition-colors duration-150 ease-in-out"
          >
            <span className="truncate flex-grow mr-2">{file}</span>
            <div className="flex-shrink-0">
              <button
                onClick={() => handlePlayStop(file)}
                className="mr-2 text-amber-500 hover:text-amber-600"
              >
                {playingFile === file ? '◼' : '▶'}
              </button>
              <button
                onClick={() => handleDelete(file)}
                className="text-red-500 hover:text-red-600"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// import { useState, useRef, useEffect } from 'react';

// interface FileListProps {
//   files: string[];
//   onFileDeleted: () => void;
// }

// export default function FileList({ files, onFileDeleted }: FileListProps) {
//   const [playingFile, setPlayingFile] = useState<string | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   useEffect(() => {
//     return () => {
//       // Cleanup: stop audio when component unmounts
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }
//     };
//   }, []);

//   const handlePlayStop = (file: string) => {
//     if (playingFile === file) {
//       // Stop playing
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }
//       setPlayingFile(null);
//     } else {
//       // Start playing
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }
//       audioRef.current = new Audio(`/alerts/${file}`);
//       audioRef.current.play();
//       audioRef.current.onended = () => setPlayingFile(null);
//       setPlayingFile(file);
//     }
//   };

//   const handleDelete = async (file: string) => {
//     if (playingFile === file && audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       setPlayingFile(null);
//     }
//     const response = await fetch(`/api/delete-audio-file?file=${file}`, { method: 'DELETE' });
//     if (response.ok) {
//       onFileDeleted();
//     }
//   };

//   return (
//     <div className="mt-4">
//       <h2 className="text-lg font-semibold mb-2">Current Sound Files</h2>
//       <ul>
//         {files.map(file => (
//           <li key={file} className="flex items-center justify-between py-2 border-b">
//             <span>{file}</span>
//             <div>
//               <button
//                 onClick={() => handlePlayStop(file)}
//                 className="mr-2 text-amber-500 hover:text-amber-600"
//               >
//                 {playingFile === file ? '◼' : '▶'}
//               </button>
//               <button
//                 onClick={() => handleDelete(file)}
//                 className="text-red-500 hover:text-red-600"
//               >
//                 🗑
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }