import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { Todo } from '@/lib/models/Todo';
import { AIService } from '@/lib/ai';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    let query: any = { userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });

    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
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
    const { title, description, dueDate, priority, tags, naturalLanguage } = body;

    let todoData: any = { userId };

    if (naturalLanguage) {
      // Use AI to parse natural language input
      const aiParsed = await AIService.parseNaturalLanguageTodo(naturalLanguage);
      todoData = { ...todoData, ...aiParsed };
      todoData.aiGenerated = true;
    } else {
      todoData = {
        ...todoData,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority: priority || 'medium',
        tags: tags || []
      };
    }

    // Predict priority if not set
    if (!todoData.priority || todoData.priority === 'medium') {
      todoData.priority = await AIService.predictPriority(todoData.title, todoData.description);
    }

    const todo = new Todo(todoData);
    await todo.save();

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
