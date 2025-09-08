import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { Todo } from '@/lib/models/Todo';
import { AIService } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await req.json();
    const { type, period } = body;

    if (type === 'suggestions') {
      // Get recent todos for context
      const recentTodos = await Todo.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);

      const suggestions = await AIService.generateTaskSuggestions(userId, recentTodos);
      
      return NextResponse.json({ suggestions });
    }

    if (type === 'summary') {
      const timeframe = period === 'weekly' ? 7 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      const todos = await Todo.find({
        userId,
        createdAt: { $gte: startDate }
      });

      const summary = await AIService.generateSummary(todos, period);
      
      return NextResponse.json({ summary });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Error in AI endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
