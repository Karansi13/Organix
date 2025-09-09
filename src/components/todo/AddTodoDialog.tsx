'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, CalendarIcon, Sparkles, X, Mic } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Todo } from '@/types';
import { useTodoStore } from '@/store';
import VoiceInput from '@/components/voice/VoiceInput';
import BrowserVoiceInput from '@/components/voice/BrowserVoiceInput';
import toast from 'react-hot-toast';

interface AddTodoDialogProps {
  onAdd: (todo: Todo) => void;
}

export default function AddTodoDialog({ onAdd }: AddTodoDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date>();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [useVoice, setUseVoice] = useState(false);
  const [voiceMethod, setVoiceMethod] = useState<'browser' | 'recording'>('browser');
  const [loading, setLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const { addTodo } = useTodoStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      if (useAI) {
        if (!naturalLanguage || naturalLanguage.trim() === '') {
          toast.error('Please provide a task description');
          return;
        }
      } else {
        if (!title || title.trim() === '') {
          toast.error('Task title is required');
          return;
        }
      }

      const todoData = useAI 
        ? { naturalLanguage: naturalLanguage.trim() }
        : {
            title: title.trim(),
            description,
            priority,
            dueDate,
            tags,
            status: 'backlog' as const
          };

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) throw new Error('Failed to create todo');

      const newTodo = await response.json();
      addTodo(newTodo);
      onAdd(newTodo);
      
      toast.success(useAI ? 'AI task created successfully!' : 'Task created successfully!');
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error creating todo:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create task');
      } else {
        toast.error('Failed to create task');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setTags([]);
    setNewTag('');
    setNaturalLanguage('');
    setUseAI(false);
    setUseVoice(false);
    setAudioBlob(null);
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

  const handleVoiceTranscription = (transcription: string) => {
    setNaturalLanguage(transcription);
    setUseAI(true);
    toast.success('Voice input received!');
  };

  const handleAudioData = (audioBlob: Blob) => {
    setAudioBlob(audioBlob);
    // Optionally store audio for future reference
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={useAI ? "default" : "outline"}
              size="sm"
              onClick={() => setUseAI(!useAI)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {useAI ? 'Using AI' : 'Use AI'}
            </Button>
            <span className="text-sm text-gray-600">
              {useAI ? 'Describe your task naturally' : 'Fill in the details manually'}
            </span>
          </div>

          {useAI ? (
            /* Natural Language Input */
            <div className="space-y-4">
              {/* Voice Input Toggle */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={useVoice ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseVoice(!useVoice)}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  {useVoice ? 'Voice Mode' : 'Use Voice'}
                </Button>
                <span className="text-sm text-gray-600">
                  {useVoice ? 'Speak your task description' : 'Click to enable voice input'}
                </span>
              </div>

              {useVoice ? (
                /* Voice Input Component */
                <div className="space-y-4">
                  {/* Voice Method Selection */}
                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-600">Voice method:</label>
                    <Button
                      type="button"
                      variant={voiceMethod === 'browser' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVoiceMethod('browser')}
                    >
                      Browser
                    </Button>
                    <Button
                      type="button"
                      variant={voiceMethod === 'recording' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVoiceMethod('recording')}
                    >
                      Recording
                    </Button>
                  </div>

                  {/* Voice Input Component */}
                  {voiceMethod === 'browser' ? (
                    <BrowserVoiceInput
                      onTranscription={handleVoiceTranscription}
                      disabled={loading}
                      className="py-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800"
                    />
                  ) : (
                    <VoiceInput
                      onTranscription={handleVoiceTranscription}
                      onAudioData={handleAudioData}
                      disabled={loading}
                      className="py-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800"
                    />
                  )}
                  
                  {naturalLanguage && (
                    <div className="space-y-2">
                      <Label>Transcribed Text (editable)</Label>
                      <Textarea
                        value={naturalLanguage}
                        onChange={(e) => setNaturalLanguage(e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Your voice input will appear here..."
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Text Input */
                <div className="space-y-2">
                  <Label htmlFor="natural-language">Describe your task</Label>
                  <Textarea
                    id="natural-language"
                    placeholder="e.g., 'Finish the quarterly report by Friday at 5 PM with high priority'"
                    value={naturalLanguage}
                    onChange={(e) => setNaturalLanguage(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                AI will extract the title, priority, due date, and tags from your description.
              </p>
            </div>
          ) : (
            /* Manual Input */
            <>
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
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
