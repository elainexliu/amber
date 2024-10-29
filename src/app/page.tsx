'use client';

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { PickingAlertDialog } from '@/components/AlertDialog'
import Link from 'next/link'

const DynamicWebcamComponent = dynamic(() => import('@/components/WebcamComponent'), { 
  ssr: false,
  loading: () => <p>Loading webcam...</p>
})

export default function Home() {
  const [picking, setPicking] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSetPicking = (isPicking: boolean) => {
    setPicking(isPicking)
  }

  if (!isMounted) {
    return null; // or a loading indicator
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
      <h1 className="text-4xl font-bold mb-8 text-amber-500">amber</h1>
      <DynamicWebcamComponent setPicking={handleSetPicking} />
      <PickingAlertDialog open={picking} />
      <div className="mt-4 flex space-x-4">
        <Link href="/edit-sounds" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded">
          Edit Sounds
        </Link>
        <Link href="/picking-history" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded">
          See Data
        </Link>
      </div>
    </main>
  )
}