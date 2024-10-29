import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const alertsDir = path.join(process.cwd(), 'public', 'alerts')
  console.log('Alerts directory:', alertsDir)
  
  try {
    const files = fs.readdirSync(alertsDir)
    console.log('Files in alerts directory:', files)
    const audioFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    console.log('Audio files found:', audioFiles)
    return NextResponse.json(audioFiles)
  } catch (error) {
    console.error('Error reading audio files:', error)
    return NextResponse.json({ error: 'Failed to read audio files' }, { status: 500 })
  }
}