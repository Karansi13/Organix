'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import KanbanBoard from '@/components/todo/KanbanBoard';
import AddTodoDialog from '@/components/todo/AddTodoDialog';
import CanvasEditor from '@/components/canvas/CanvasEditor';
import ClientOnly from '@/components/ClientOnly';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { Todo } from '@/types';
import { useTodoStore } from '@/store';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { userId } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');

  const { setTodos: setStoreTodos } = useTodoStore();

  useEffect(() => {
    if (userId) {
      fetchTodos();
      fetchAISuggestions();
      fetchDailySummary();
    }
  }, [userId]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Failed to fetch todos');
      
      const data = await response.json();
      setTodos(data);
      setStoreTodos(data);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'suggestions' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'summary', period: 'daily' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || '');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update todo');

      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => 
        todo._id === id ? updatedTodo : todo
      ));
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      setTodos(prev => prev.filter(todo => todo._id !== id));
    } catch (error) {
      throw error;
    }
  };

  const handleAddTodo = (newTodo: Todo) => {
    setTodos(prev => [newTodo, ...prev]);
  };

  // Calculate stats
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    inProgress: todos.filter(t => t.status === 'in-progress').length,
    overdue: todos.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'completed'
    ).length
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClientOnly fallback={<div className="w-24 h-9 bg-gray-200 rounded animate-pulse"></div>}>
            <CanvasEditor />
          </ClientOnly>
          <ClientOnly fallback={<div className="w-24 h-9 bg-gray-200 rounded animate-pulse"></div>}>
            <AddTodoDialog onAdd={handleAddTodo} />
          </ClientOnly>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active tasks in your workspace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban Board */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Task Board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientOnly fallback={
                <div className="grid grid-cols-3 gap-4 h-64">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              }>
                <KanbanBoard 
                  todos={todos}
                  onUpdateTodo={handleUpdateTodo}
                  onDeleteTodo={handleDeleteTodo}
                />
              </ClientOnly>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Daily Summary */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round((suggestion.confidence || 0.8) * 100)}% confidence
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          Add Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todos
                  .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
                  .slice(0, 5)
                  .map((todo) => (
                    <div key={todo._id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        todo.status === 'completed' ? 'bg-green-500' :
                        todo.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{todo.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(todo.updatedAt || todo.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
