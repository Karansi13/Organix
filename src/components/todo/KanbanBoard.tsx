'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Circle,
  Flag,
  Tag,
  GripVertical,
  Palette
} from 'lucide-react';
import { Todo, TodoStatus } from '@/types';
import { formatDate, getPriorityColor, isOverdue, getDaysUntilDue } from '@/lib/utils';
import { useTodoStore } from '@/store';
import EditTodoDialog from './EditTodoDialog';
import TodoCanvasEditor from '@/components/canvas/TodoCanvasEditor';
import toast from 'react-hot-toast';

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
}

const columns: { id: TodoStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-50 dark:bg-gray-800' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900' },
  { id: 'completed', title: 'Completed', color: 'bg-green-50 dark:bg-green-900' }
];

export default function KanbanBoard({ todos, onUpdateTodo, onDeleteTodo }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TodoStatus | null>(null);

  const { updateTodo, deleteTodo } = useTodoStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, todo: Todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTodo(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (status: TodoStatus) => {
    setDragOverColumn(status);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: TodoStatus) => {
    e.preventDefault();
    
    if (!draggedTodo || draggedTodo.status === newStatus) {
      return;
    }

    try {
      await onUpdateTodo(draggedTodo._id!, { status: newStatus });
      updateTodo(draggedTodo._id!, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const newStatus: TodoStatus = todo.status === 'completed' ? 'backlog' : 'completed';
    try {
      await onUpdateTodo(todo._id!, { status: newStatus });
      updateTodo(todo._id!, { status: newStatus });
      toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (todoId: string) => {
    if (confirm('Are you sure you want to delete this task? This will also delete any attached drawings.')) {
      try {
        await onDeleteTodo(todoId);
        deleteTodo(todoId);
        toast.success('Task deleted');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const getTodosByStatus = (status: TodoStatus) => {
    return todos.filter(todo => todo.status === status);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map((column) => (
        <div 
          key={column.id} 
          className={`${column.color} rounded-lg p-4 ${
            dragOverColumn === column.id ? 'ring-2 ring-blue-400' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={() => handleDragEnter(column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{column.title}</h3>
            <Badge variant="secondary">
              {getTodosByStatus(column.id).length}
            </Badge>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {getTodosByStatus(column.id).map((todo) => (
              <Card
                key={todo._id}
                className={`cursor-move hover:shadow-md transition-all duration-200 ${
                  draggedTodo?._id === todo._id ? 'opacity-50 rotate-1 scale-105' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <h4 className="font-medium text-sm line-clamp-2 flex-1">
                        {todo.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <TodoCanvasEditor todoId={todo._id!} />
                      <EditTodoDialog todo={todo} onUpdate={onUpdateTodo} />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(todo);
                        }}
                      >
                        {todo.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(todo._id!);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {todo.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {todo.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getPriorityColor(todo.priority)} text-xs`}
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        {todo.priority}
                      </Badge>
                      
                      {todo.aiGenerated && (
                        <Badge variant="outline" className="text-xs">
                          AI
                        </Badge>
                      )}

                      {todo.calendarEventId && (
                        <Badge variant="outline" className="text-xs text-blue-600">
                          📅 Synced
                        </Badge>
                      )}
                    </div>

                    {todo.dueDate && (
                      <div className={`flex items-center gap-1 ${
                        isOverdue(todo.dueDate) ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(todo.dueDate)}</span>
                      </div>
                    )}
                  </div>

                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {todo.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {todo.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{todo.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {todo.dueDate && (
                    <div className="mt-2 text-xs text-gray-500">
                      {getDaysUntilDue(todo.dueDate) > 0 ? (
                        `Due in ${getDaysUntilDue(todo.dueDate)} days`
                      ) : getDaysUntilDue(todo.dueDate) === 0 ? (
                        'Due today'
                      ) : (
                        `Overdue by ${Math.abs(getDaysUntilDue(todo.dueDate))} days`
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
