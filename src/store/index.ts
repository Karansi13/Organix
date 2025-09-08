import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Todo, User, AISuggestion, CanvasDrawing } from '@/types';

interface TodoStore {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  selectedTodo: Todo | null;
  aiSuggestions: AISuggestion[];
  
  // Actions
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  setSelectedTodo: (todo: Todo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAISuggestions: (suggestions: AISuggestion[]) => void;
  
  // Computed values
  getTodosByStatus: (status: Todo['status']) => Todo[];
  getTodosByPriority: (priority: Todo['priority']) => Todo[];
  getOverdueTodos: () => Todo[];
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      loading: false,
      error: null,
      selectedTodo: null,
      aiSuggestions: [],

      setTodos: (todos) => set({ todos }),
      
      addTodo: (todo) => set((state) => ({ 
        todos: [...state.todos, todo] 
      })),
      
      updateTodo: (id, updates) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo._id === id ? { ...todo, ...updates } : todo
        ),
      })),
      
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo._id !== id),
      })),
      
      setSelectedTodo: (todo) => set({ selectedTodo: todo }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),

      getTodosByStatus: (status) => {
        const { todos } = get();
        return todos.filter((todo) => todo.status === status);
      },

      getTodosByPriority: (priority) => {
        const { todos } = get();
        return todos.filter((todo) => todo.priority === priority);
      },

      getOverdueTodos: () => {
        const { todos } = get();
        const now = new Date();
        return todos.filter(
          (todo) => todo.dueDate && new Date(todo.dueDate) < now && todo.status !== 'completed'
        );
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({
        todos: state.todos,
        selectedTodo: state.selectedTodo,
      }),
    }
  )
);

interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeView: 'kanban' | 'list' | 'calendar';
  canvasOpen: boolean;
  
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActiveView: (view: 'kanban' | 'list' | 'calendar') => void;
  setCanvasOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'system',
      activeView: 'kanban',
      canvasOpen: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setActiveView: (view) => set({ activeView: view }),
      setCanvasOpen: (open) => set({ canvasOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'ui-storage',
    }
  )
);

interface CanvasStore {
  drawings: CanvasDrawing[];
  selectedDrawing: CanvasDrawing | null;
  
  setDrawings: (drawings: CanvasDrawing[]) => void;
  addDrawing: (drawing: CanvasDrawing) => void;
  updateDrawing: (id: string, updates: Partial<CanvasDrawing>) => void;
  deleteDrawing: (id: string) => void;
  setSelectedDrawing: (drawing: CanvasDrawing | null) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  drawings: [],
  selectedDrawing: null,

  setDrawings: (drawings) => set({ drawings }),
  
  addDrawing: (drawing) => set((state) => ({
    drawings: [...state.drawings, drawing]
  })),
  
  updateDrawing: (id, updates) => set((state) => ({
    drawings: state.drawings.map((drawing) =>
      drawing._id === id ? { ...drawing, ...updates } : drawing
    ),
  })),
  
  deleteDrawing: (id) => set((state) => ({
    drawings: state.drawings.filter((drawing) => drawing._id !== id),
  })),
  
  setSelectedDrawing: (drawing) => set({ selectedDrawing: drawing }),
}));
