import { NextResponse } from 'next/server';
import { writeFile, readdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let fileName = file.name;
  if (!fileName.toLowerCase().endsWith('.mp3')) {
    fileName = `${fileName}.mp3`;
  }

  const alertsDir = path.join(process.cwd(), 'public', 'alerts');
  
  // Check for existing files with the same name
  const existingFiles = await readdir(alertsDir);
  let counter = 1;
  while (existingFiles.includes(fileName)) {
    const nameparts = path.parse(fileName);
    fileName = `${nameparts.name}_${counter}${nameparts.ext}`;
    counter++;
  }

  const filePath = path.join(alertsDir, fileName);

  try {
    await writeFile(filePath, buffer);
    return NextResponse.json({ fileName }, { status: 200 });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
}