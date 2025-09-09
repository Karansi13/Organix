'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Todo } from '@/types';
import { useTodoStore } from '@/store';
import toast from 'react-hot-toast';

interface EditTodoDialogProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

export default function EditTodoDialog({ todo, onUpdate }: EditTodoDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(todo.priority);
  const [status, setStatus] = useState(todo.status);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [tags, setTags] = useState<string[]>(todo.tags || []);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(!!todo.calendarEventId);

  const { updateTodo } = useTodoStore();

  useEffect(() => {
    if (open) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setStatus(todo.status);
      setDueDate(todo.dueDate ? new Date(todo.dueDate) : undefined);
      setTags(todo.tags || []);
      setSyncToCalendar(!!todo.calendarEventId);
    }
  }, [open, todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: Partial<Todo> = {
        title,
        description,
        priority,
        status,
        dueDate,
        tags,
      };

      // Handle Google Calendar sync
      if (syncToCalendar && dueDate) {
        // Create or update calendar event
        const calendarResponse = await fetch('/api/calendar/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            todoId: todo._id,
            title,
            description,
            dueDate,
            action: todo.calendarEventId ? 'update' : 'create'
          }),
        });

        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          updates.calendarEventId = calendarData.eventId;
        }
      } else if (!syncToCalendar && todo.calendarEventId) {
        // Remove from calendar
        await fetch('/api/calendar/sync', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: todo.calendarEventId }),
        });
        updates.calendarEventId = undefined;
      }

      await onUpdate(todo._id!, updates);
      updateTodo(todo._id!, updates);
      
      toast.success('Task updated successfully!');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Google Calendar Sync */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sync-calendar"
              checked={syncToCalendar}
              onChange={(e) => setSyncToCalendar(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="sync-calendar">Sync with Google Calendar</Label>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
