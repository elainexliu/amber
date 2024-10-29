import { useState, useRef } from 'react';

interface RecordAudioProps {
  onRecordingComplete: (fileName: string) => void;
  existingFiles: string[];
}

export default function RecordAudio({ onRecordingComplete, existingFiles }: RecordAudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [nameError, setNameError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorderRef.current.addEventListener('stop', handleStop);
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleDataAvailable = (e: BlobEvent) => {
    if (e.data.size > 0) {
      chunksRef.current.push(e.data);
    }
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    setAudioURL(URL.createObjectURL(blob));
    chunksRef.current = [];
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    setNameError('');
  };

  const uploadRecording = async () => {
    if (!audioURL || !fileName) return;

    if (existingFiles.includes(fileName + '.mp3')) {
      setNameError('A file with this name already exists. Please choose a different name.');
      return;
    }

    const response = await fetch(audioURL);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, `${fileName}.mp3`);

    const uploadResponse = await fetch('/api/upload-audio-file', {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      const { fileName: uploadedFileName } = await uploadResponse.json();
      onRecordingComplete(uploadedFileName);
      setAudioURL(null);
      setFileName('');
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Record Your Own Sound</h2>
      {!isRecording && !audioURL && (
        <button
          onClick={startRecording}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded"
        >
          Start Recording
        </button>
      )}
      {isRecording && (
        <button
          onClick={stopRecording}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Stop Recording
        </button>
      )}
      {audioURL && (
        <div>
          <audio src={audioURL} controls className="mb-2" />
          <input
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            placeholder="Enter file name"
            className="border p-2 mr-2"
          />
          <button
            onClick={uploadRecording}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            disabled={!fileName}
          >
            Upload Recording
          </button>
          {nameError && <p className="text-red-500 mt-2">{nameError}</p>}
        </div>
      )}
    </div>
  );
}