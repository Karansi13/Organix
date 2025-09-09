'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Search, 
  Grid3X3, 
  List, 
  Plus,
  Calendar,
  Eye,
  Trash2,
  Download
} from 'lucide-react';
import { useCanvasStore } from '@/store';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CanvasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [drawings, setDrawings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { drawings: storeDrawings, setDrawings: setStoreDrawings } = useCanvasStore();

  useEffect(() => {
    fetchDrawings();
  }, []);

  const fetchDrawings = async () => {
    try {
      const response = await fetch('/api/canvas');
      if (response.ok) {
        const data = await response.json();
        setDrawings(data);
        setStoreDrawings(data);
      }
    } catch (error) {
      console.error('Error fetching drawings:', error);
      toast.error('Failed to load drawings');
    } finally {
      setLoading(false);
    }
  };

  const deleteDrawing = async (id: string) => {
    if (confirm('Are you sure you want to delete this drawing?')) {
      try {
        const response = await fetch(`/api/canvas/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setDrawings(drawings.filter(d => d._id !== id));
          toast.success('Drawing deleted');
        }
      } catch (error) {
        toast.error('Failed to delete drawing');
      }
    }
  };

  const downloadDrawing = (drawing: any) => {
    if (drawing.preview) {
      const link = document.createElement('a');
      link.download = `${drawing.name}.png`;
      link.href = drawing.preview;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredDrawings = drawings.filter(drawing =>
    drawing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Canvas Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            All your drawings and visual notes in one place.
          </p>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search drawings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {filteredDrawings.length} drawings
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Drawings Display */}
      {filteredDrawings.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Palette className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No drawings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Start creating drawings by opening the canvas editor from any task, 
              or create a standalone drawing.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }>
          {filteredDrawings.map((drawing) => (
            <Card key={drawing._id} className="hover:shadow-lg transition-shadow duration-200">
              {viewMode === 'grid' ? (
                <div>
                  {/* Preview Image */}
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                    {drawing.preview ? (
                      <img
                        src={drawing.preview}
                        alt={drawing.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Palette className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {drawing.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(drawing.createdAt)}
                      </span>
                      {drawing.todoId && (
                        <Badge variant="outline" className="text-xs">
                          Task Drawing
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadDrawing(drawing)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteDrawing(drawing._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                      {drawing.preview ? (
                        <img
                          src={drawing.preview}
                          alt={drawing.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Palette className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {drawing.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(drawing.createdAt)}
                        </span>
                        {drawing.todoId && (
                          <Badge variant="outline" className="text-xs">
                            Task Drawing
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadDrawing(drawing)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteDrawing(drawing._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
