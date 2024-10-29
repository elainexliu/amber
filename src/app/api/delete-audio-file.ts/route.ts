import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', 'alerts', file);

  try {
    await unlink(filePath);
    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const testFilePath = path.join(process.cwd(), 'public', 'alerts', 'test.txt');
  try {
    // Try to create a file
    await writeFile(testFilePath, 'Test content');
    // If successful, try to delete it
    await unlink(testFilePath);
    return NextResponse.json({ message: 'File operations successful' }, { status: 200 });
  } catch (error) {
    console.error('Error during file operation test:', error);
    return NextResponse.json({ error: 'File operation test failed' }, { status: 500 });
  }
}