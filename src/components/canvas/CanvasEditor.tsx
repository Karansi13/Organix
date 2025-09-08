'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Save, 
  Download, 
  Trash2,
  Undo,
  Redo
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCanvasStore } from '@/store';
import toast from 'react-hot-toast';

interface CanvasEditorProps {
  todoId?: string;
  onSave?: (canvasData: string, preview: string) => void;
}

export default function CanvasEditor({ todoId, onSave }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'select'>('pen');
  const [canvasName, setCanvasName] = useState('');
  const [open, setOpen] = useState(false);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { addDrawing } = useCanvasStore();

  // Handle mounting to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Fabric.js dynamically to avoid SSR issues
  useEffect(() => {
    if (mounted && open && !fabricLoaded) {
      const loadFabric = async () => {
        try {
          const { fabric } = await import('fabric');
          
          if (canvasRef.current && !fabricCanvasRef.current) {
            const canvas = new fabric.Canvas(canvasRef.current, {
              width: 800,
              height: 600,
              backgroundColor: 'white'
            });

            fabricCanvasRef.current = canvas;
            setFabricLoaded(true);

            // Set initial drawing mode
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = brushSize;
            canvas.freeDrawingBrush.color = brushColor;
          }
        } catch (error) {
          console.error('Failed to load Fabric.js:', error);
          toast.error('Failed to load canvas editor');
        }
      };

      loadFabric();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setFabricLoaded(false);
      }
    };
  }, [mounted, open, brushSize, brushColor]);

  // Update canvas tool when tool changes
  useEffect(() => {
    if (fabricCanvasRef.current && fabricLoaded) {
      const canvas = fabricCanvasRef.current;
      
      switch (tool) {
        case 'pen':
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.freeDrawingBrush.width = brushSize;
          canvas.freeDrawingBrush.color = brushColor;
          break;
        case 'eraser':
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.freeDrawingBrush.width = brushSize * 2;
          canvas.freeDrawingBrush.color = 'white';
          break;
        case 'select':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          break;
      }
    }
  }, [tool, brushColor, brushSize, fabricLoaded]);

  const addRectangle = async () => {
    if (fabricCanvasRef.current) {
      const { fabric } = await import('fabric');
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: brushColor,
        stroke: brushColor,
        strokeWidth: 2
      });
      fabricCanvasRef.current.add(rect);
    }
  };

  const addCircle = async () => {
    if (fabricCanvasRef.current) {
      const { fabric } = await import('fabric');
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: 'transparent',
        stroke: brushColor,
        strokeWidth: 2
      });
      fabricCanvasRef.current.add(circle);
    }
  };

  const addText = async () => {
    if (fabricCanvasRef.current) {
      const { fabric } = await import('fabric');
      const text = new fabric.IText('Click to edit', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: brushColor
      });
      fabricCanvasRef.current.add(text);
    }
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = 'white';
      fabricCanvasRef.current.renderAll();
    }
  };

  const undo = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        fabricCanvasRef.current.remove(objects[objects.length - 1]);
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  const saveCanvas = async () => {
    if (!fabricCanvasRef.current || !canvasName.trim()) {
      toast.error('Please enter a name for your drawing');
      return;
    }

    try {
      const canvasData = JSON.stringify(fabricCanvasRef.current.toJSON());
      const preview = fabricCanvasRef.current.toDataURL('image/png');

      const response = await fetch('/api/canvas', {
        method: 'POST',
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
      addDrawing(savedDrawing);
      
      if (onSave) {
        onSave(canvasData, preview);
      }

      toast.success('Drawing saved successfully!');
      setCanvasName('');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to save drawing');
      console.error('Error saving canvas:', error);
    }
  };

  const downloadCanvas = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${canvasName || 'drawing'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration errors
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Canvas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Visual Canvas Editor</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              {/* Tools */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  size="sm"
                  variant={tool === 'pen' ? 'default' : 'outline'}
                  onClick={() => setTool('pen')}
                  disabled={!fabricLoaded}
                >
                  <Palette className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  onClick={() => setTool('eraser')}
                  disabled={!fabricLoaded}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={tool === 'select' ? 'default' : 'outline'}
                  onClick={() => setTool('select')}
                  disabled={!fabricLoaded}
                >
                  Select
                </Button>
              </div>

              {/* Shapes */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={addRectangle}
                  disabled={!fabricLoaded}
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={addCircle}
                  disabled={!fabricLoaded}
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={addText}
                  disabled={!fabricLoaded}
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>

              {/* Color and Size */}
              <div className="flex items-center gap-2 border-r pr-2">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 rounded border"
                  disabled={!fabricLoaded}
                />
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Size:</Label>
                  <Input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20"
                    disabled={!fabricLoaded}
                  />
                  <span className="text-xs w-6">{brushSize}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={undo}
                  disabled={!fabricLoaded}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={clearCanvas}
                  disabled={!fabricLoaded}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Save Controls */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Drawing name"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                className="w-40"
              />
              <Button 
                onClick={saveCanvas} 
                className="flex items-center gap-2"
                disabled={!fabricLoaded}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadCanvas}
                disabled={!fabricLoaded}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
            {!fabricLoaded && (
              <div className="flex items-center justify-center text-gray-500">
                <div className="spinner mr-2"></div>
                Loading canvas editor...
              </div>
            )}
            <div className={`border-2 border-gray-300 bg-white rounded-lg overflow-hidden shadow-lg ${!fabricLoaded ? 'hidden' : ''}`}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
