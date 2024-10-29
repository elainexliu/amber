import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const MODAL_BACKEND_URL = process.env.MODAL_BACKEND_URL || 'https://elainexliu--dermora-backend-fastapi-app.modal.run'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    if (!formData) {
      return NextResponse.json({ message: 'Image data is required' }, { status: 400 })
    }

    const backendResponse = await axios.post(`${MODAL_BACKEND_URL}/detect`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return NextResponse.json(backendResponse.data)
  } catch (error) {
    console.error('Error in detect-picking API route:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}