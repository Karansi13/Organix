import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { CanvasDrawing } from '@/lib/models/CanvasDrawing';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const url = new URL(req.url);
    const todoId = url.searchParams.get('todoId');

    const query: any = { userId };
    if (todoId) {
      query.todoId = todoId;
    }

    const drawings = await CanvasDrawing.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(drawings);
  } catch (error) {
    console.error('Error fetching canvas drawings:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await req.json();
    const { name, data, preview, todoId } = body;

    if (!name || !data) {
      return NextResponse.json(
        { error: 'Name and data are required' }, 
        { status: 400 }
      );
    }

    const drawing = new CanvasDrawing({
      userId,
      name,
      data,
      preview,
      todoId
    });

    await drawing.save();

    return NextResponse.json(drawing);
  } catch (error) {
    console.error('Error creating canvas drawing:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
