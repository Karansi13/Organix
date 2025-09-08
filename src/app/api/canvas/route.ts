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
    
    const { searchParams } = new URL(req.url);
    const todoId = searchParams.get('todoId');

    let query: any = { userId };
    if (todoId) query.todoId = todoId;

    const drawings = await CanvasDrawing.find(query).sort({ createdAt: -1 });

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
    const { data, name, todoId, preview } = body;

    const drawing = new CanvasDrawing({
      userId,
      todoId,
      data,
      name,
      preview
    });

    await drawing.save();

    return NextResponse.json(drawing, { status: 201 });
  } catch (error) {
    console.error('Error creating canvas drawing:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
