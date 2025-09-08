export interface Todo {
  _id?: string;
  title: string;
  description?: string;
  status: 'backlog' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  aiGenerated?: boolean;
  calendarEventId?: string;
  attachments?: {
    type: 'canvas' | 'file';
    url: string;
    name: string;
  }[];
}

export interface Board {
  _id?: string;
  name: string;
  description?: string;
  userId: string;
  collaborators?: {
    userId: string;
    permission: 'read' | 'write';
  }[];
  todos: Todo[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id?: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    googleCalendarSync: boolean;
    aiSuggestions: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AISuggestion {
  type: 'task' | 'priority' | 'schedule';
  title: string;
  description: string;
  confidence: number;
  metadata?: any;
}

export interface CanvasDrawing {
  _id?: string;
  userId: string;
  todoId?: string;
  data: string; // Canvas data as JSON string
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  todoId?: string;
}

export interface Notification {
  _id?: string;
  userId: string;
  type: 'reminder' | 'deadline' | 'collaboration';
  title: string;
  message: string;
  read: boolean;
  todoId?: string;
  createdAt?: Date;
}

export type TodoStatus = 'backlog' | 'in-progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type Theme = 'light' | 'dark' | 'system';
