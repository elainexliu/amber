'use client';

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface WebcamComponentProps {
    setPicking: (picking: boolean) => void
}

export default function WebcamComponent({ setPicking }: WebcamComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioFilesRef = useRef<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isInCooldown, setIsInCooldown] = useState(false)
  const lastPickTimeRef = useRef<number>(0)

  const loadAudioFiles = useCallback(async () => {
    try {
      console.log('Fetching audio files...')
      const response = await fetch('/api/get-audio-files')
      console.log('Response status:', response.status)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio files: ${response.status} ${response.statusText}`)
      }
      const files = await response.json()
      console.log('Loaded audio files:', files)
      if (Array.isArray(files) && files.length > 0) {
        audioFilesRef.current = files
        console.log('Updated audioFilesRef:', audioFilesRef.current)
      } else {
        console.warn('No audio files were loaded or invalid response format')
      }
    } catch (error) {
      console.error('Error loading audio files:', error)
    }
  }, [])

  useEffect(() => {
    startWebcam()
    loadAudioFiles()
    const interval = setInterval(checkForPicking, 500)
    return () => {
      clearInterval(interval)
      stopWebcam()
    }
  }, [loadAudioFiles])

  useEffect(() => {
    if (audioRef.current) {
      console.log('Audio ref is set')
    } else {
      console.log('Audio ref is not set')
    }
  }, [])

  const playRandomAlert = useCallback(() => {
    console.log('Current audioFiles:', audioFilesRef.current)
    if (audioFilesRef.current.length > 0 && audioRef.current) {
      const randomFile = audioFilesRef.current[Math.floor(Math.random() * audioFilesRef.current.length)]
      console.log('Attempting to play:', randomFile)
      audioRef.current.src = `/alerts/${randomFile}`
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          if (audioRef.current.duration > 5) {
            audioRef.current.addEventListener('timeupdate', function listener() {
              if (audioRef.current && audioRef.current.currentTime >= 3) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('timeupdate', listener);
              }
            });
          }
        }
      };
      audioRef.current.play()
        .then(() => console.log('Audio started playing'))
        .catch(error => console.error('Error playing audio:', error))
    } else {
      console.log('No audio files available or audio ref not set')
      console.log('Audio files:', audioFilesRef.current)
      console.log('Audio ref:', audioRef.current)
    }
  }, [])

  async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing webcam:', error)
        setError('Failed to access webcam. Please make sure it\'s connected and you\'ve granted permission.')
      }
  }

  function stopWebcam() {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  async function checkForPicking() {
    if (!videoRef.current || isInCooldown) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
  
    canvas.toBlob(async (blob) => {
      if (!blob) return

      const formData = new FormData()
      formData.append('file', blob, 'image.jpg')

      try {
        const response = await fetch('/api/detect-picking', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.picking_detected && !isInCooldown) {
          console.log('Picking detected, playing alert')
          console.log('Current audioFiles before playing:', audioFilesRef.current)
          if (Date.now() - lastPickTimeRef.current > 5000) {
            setPicking(true)
            await logPickingEvent()
            playRandomAlert()
            setIsInCooldown(true)
            setTimeout(() => {
              setPicking(false)
              setIsInCooldown(false)}, 3000) // 3 second cooldown before next detection
          }

          lastPickTimeRef.current = Date.now()
        }
      } catch (error) {
        console.error('Error checking for picking:', error)
        setError('Failed to process image. Please try again later.')
      }
    }, 'image/jpeg')
  }

  async function logPickingEvent() {
    try {
      const { data, error } = await supabase
        .from('picking_events')
        .insert({ timestamp: new Date().toISOString() })
      if (error) throw error
      console.log('Logged picking event:', data)
    } catch (error) {
      console.error('Error logging picking event:', error)
    }
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }
  return (
    <>
      <video ref={videoRef} autoPlay muted className="mb-4 rounded-lg shadow-lg scale-x-[-1]" />
      <audio ref={audioRef} />
      {/* <button onClick={playRandomAlert}>Play Random Alert</button> */}
    </>
  )
}