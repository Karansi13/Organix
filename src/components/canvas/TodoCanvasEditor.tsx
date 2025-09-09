'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Palette, 
  Square, 
  Circle, 
  Minus,
  Type, 
  Eraser, 
  MousePointer2,
  Save, 
  Download, 
  Trash2,
  Undo,
  Redo,
  Move,
  RotateCcw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCanvasStore } from '@/store';
import toast from 'react-hot-toast';

interface TodoCanvasEditorProps {
  todoId: string;
}

interface DrawingElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'freehand';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  text?: string;
  path?: { x: number; y: number }[];
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize?: number;
}

const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080'
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16];

export default function TodoCanvasEditor({ todoId }: TodoCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tool, setTool] = useState<'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'freehand' | 'eraser'>('select');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [canvasName, setCanvasName] = useState('');
  const [existingCanvas, setExistingCanvas] = useState<any>(null);

  const { addDrawing, updateDrawing } = useCanvasStore();

  useEffect(() => {
    setMounted(true);
    if (open) {
      loadExistingCanvas();
    }
  }, [open, todoId]);

  const loadExistingCanvas = async () => {
    try {
      const response = await fetch(`/api/canvas?todoId=${todoId}`);
      if (response.ok) {
        const drawings = await response.json();
        if (drawings.length > 0) {
          const canvas = drawings[0];
          setExistingCanvas(canvas);
          setCanvasName(canvas.name);
          if (canvas.data) {
            const parsedData = JSON.parse(canvas.data);
            setElements(parsedData.elements || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToHistory = (newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements([...history[historyStep - 1]]);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements([...history[historyStep + 1]]);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);

    if (tool === 'select') {
      // Handle selection
      const clickedElement = elements.find(el => isPointInElement(pos, el));
      setSelectedElement(clickedElement?.id || null);
      return;
    }

    const newElement: DrawingElement = {
      id: generateId(),
      type: tool as any,
      x: pos.x,
      y: pos.y,
      strokeColor,
      fillColor,
      strokeWidth,
    };

    if (tool === 'text') {
      newElement.text = 'Double click to edit';
      newElement.fontSize = 16;
    } else if (tool === 'freehand') {
      newElement.path = [pos];
    }

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;

    const pos = getMousePos(e);

    if (tool === 'rectangle') {
      setCurrentElement({
        ...currentElement,
        width: pos.x - currentElement.x,
        height: pos.y - currentElement.y
      });
    } else if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - currentElement.x, 2) + Math.pow(pos.y - currentElement.y, 2)
      );
      setCurrentElement({
        ...currentElement,
        radius
      });
    } else if (tool === 'line') {
      setCurrentElement({
        ...currentElement,
        endX: pos.x,
        endY: pos.y
      });
    } else if (tool === 'freehand') {
      setCurrentElement({
        ...currentElement,
        path: [...(currentElement.path || []), pos]
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;

    const newElements = [...elements, currentElement];
    setElements(newElements);
    addToHistory(newElements);
    setCurrentElement(null);
    setIsDrawing(false);
  };

  const isPointInElement = (point: { x: number; y: number }, element: DrawingElement): boolean => {
    switch (element.type) {
      case 'rectangle':
        return point.x >= element.x && 
               point.x <= element.x + (element.width || 0) &&
               point.y >= element.y && 
               point.y <= element.y + (element.height || 0);
      case 'circle':
        const distance = Math.sqrt(
          Math.pow(point.x - element.x, 2) + Math.pow(point.y - element.y, 2)
        );
        return distance <= (element.radius || 0);
      case 'text':
        return point.x >= element.x && 
               point.x <= element.x + 100 && // Approximate text width
               point.y >= element.y - 20 && 
               point.y <= element.y + 20;
      default:
        return false;
    }
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.strokeColor;
    ctx.fillStyle = element.fillColor;
    ctx.lineWidth = element.strokeWidth;

    switch (element.type) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width || 0, element.height || 0);
        if (element.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius || 0, 0, 2 * Math.PI);
        if (element.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.endX || element.x, element.endY || element.y);
        ctx.stroke();
        break;
      case 'text':
        ctx.font = `${element.fontSize || 16}px Arial`;
        ctx.fillStyle = element.strokeColor;
        ctx.fillText(element.text || '', element.x, element.y);
        break;
      case 'freehand':
        if (element.path && element.path.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.path[0].x, element.path[0].y);
          for (let i = 1; i < element.path.length; i++) {
            ctx.lineTo(element.path[i].x, element.path[i].y);
          }
          ctx.stroke();
        }
        break;
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach(element => drawElement(ctx, element));

    // Draw current element being drawn
    if (currentElement) {
      drawElement(ctx, currentElement);
    }

    // Draw selection outline
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        if (element.type === 'rectangle') {
          ctx.strokeRect(element.x - 5, element.y - 5, (element.width || 0) + 10, (element.height || 0) + 10);
        } else if (element.type === 'circle') {
          ctx.beginPath();
          ctx.arc(element.x, element.y, (element.radius || 0) + 5, 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        ctx.setLineDash([]);
      }
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [elements, currentElement, selectedElement]);

  const clearCanvas = () => {
    setElements([]);
    addToHistory([]);
    setSelectedElement(null);
  };

  const deleteSelected = () => {
    if (selectedElement) {
      const newElements = elements.filter(el => el.id !== selectedElement);
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(null);
    }
  };

  const saveCanvas = async () => {
    if (!canvasName.trim()) {
      toast.error('Please enter a name for your drawing');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const canvasData = JSON.stringify({ elements });
      const preview = canvas.toDataURL('image/png');

      const url = existingCanvas ? `/api/canvas/${existingCanvas._id}` : '/api/canvas';
      const method = existingCanvas ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: canvasName,
          data: canvasData,
          preview,
          todoId
        })
      });

      if (!response.ok) throw new Error('Failed to save canvas');

      const savedDrawing = await response.json();
      
      if (existingCanvas) {
        updateDrawing(existingCanvas._id, savedDrawing);
      } else {
        addDrawing(savedDrawing);
        setExistingCanvas(savedDrawing);
      }

      toast.success('Drawing saved successfully!');
    } catch (error) {
      toast.error('Failed to save drawing');
      console.error('Error saving canvas:', error);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${canvasName || 'todo-drawing'}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Palette className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Task Canvas - Sketch & Draw</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800 rounded-t-lg">
            <div className="flex items-center gap-4">
              {/* Tools */}
              <div className="flex items-center gap-1 border-r pr-4">
                <Button
                  size="sm"
                  variant={tool === 'select' ? 'default' : 'outline'}
                  onClick={() => setTool('select')}
                  className="h-9 w-9 p-0"
                >
                  <MousePointer2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => setTool('rectangle')}
                  className="h-9 w-9 p-0"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'circle' ? 'default' : 'outline'}
                  onClick={() => setTool('circle')}
                  className="h-9 w-9 p-0"
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'line' ? 'default' : 'outline'}
                  onClick={() => setTool('line')}
                  className="h-9 w-9 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'freehand' ? 'default' : 'outline'}
                  onClick={() => setTool('freehand')}
                  className="h-9 w-9 p-0"
                >
                  <Palette className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'text' ? 'default' : 'outline'}
                  onClick={() => setTool('text')}
                  className="h-9 w-9 p-0"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  onClick={() => setTool('eraser')}
                  className="h-9 w-9 p-0"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-2 border-r pr-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-9 p-0"
                      style={{ backgroundColor: strokeColor }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="grid grid-cols-5 gap-1">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: color,
                            borderColor: strokeColor === color ? '#007bff' : '#ccc'
                          }}
                          onClick={() => setStrokeColor(color)}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="text-xs px-2">
                      {strokeWidth}px
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32">
                    <div className="space-y-1">
                      {STROKE_WIDTHS.map(width => (
                        <button
                          key={width}
                          className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                            strokeWidth === width ? 'bg-blue-100' : ''
                          }`}
                          onClick={() => setStrokeWidth(width)}
                        >
                          {width}px
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={undo}
                  disabled={historyStep <= 0}
                  className="h-9 w-9 p-0"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={redo}
                  disabled={historyStep >= history.length - 1}
                  className="h-9 w-9 p-0"
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteSelected}
                  disabled={!selectedElement}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCanvas}
                  className="h-9 w-9 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Save Controls */}
            <div className="flex items-center gap-3">
              <Input
                placeholder="Drawing name"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                className="w-40"
              />
              <Button onClick={saveCanvas} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={downloadCanvas}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="border-2 border-gray-300 bg-white rounded-lg shadow-xl">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="rounded-lg cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
