import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { CanvasDrawing } from '@/lib/models/CanvasDrawing';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await req.json();
    const { data, name, preview } = body;

    const drawing = await CanvasDrawing.findOneAndUpdate(
      { _id: params.id, userId },
      { data, name, preview, updatedAt: new Date() },
      { new: true }
    );

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    return NextResponse.json(drawing);
  } catch (error) {
    console.error('Error updating canvas drawing:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const drawing = await CanvasDrawing.findOneAndDelete({ 
      _id: params.id, 
      userId 
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Drawing deleted successfully' });
  } catch (error) {
    console.error('Error deleting canvas drawing:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
