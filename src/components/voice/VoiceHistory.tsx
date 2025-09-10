'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Clock, 
  Mic,
  Volume2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VoiceRecording {
  _id: string;
  transcription: string;
  audioFormat: string;
  duration: number;
  language: string;
  confidence: number;
  createdAt: string;
}

interface VoiceHistoryProps {
  className?: string;
}

export default function VoiceHistory({ className }: VoiceHistoryProps) {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/voice/transcribe?limit=20');
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast.error('Failed to load voice recordings');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No voice recordings yet</p>
            <p className="text-sm">Your voice inputs will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Recording History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recordings.map((recording) => (
            <div 
              key={recording._id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* Play Button */}
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 h-8 w-8 p-0"
                onClick={() => {
                  // Note: In production, you'd implement audio playback
                  toast('Audio playback would be implemented here');
                }}
              >
                {playingId === recording._id ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>

              {/* Recording Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 mb-1">
                  {recording.transcription}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(recording.duration)}
                  </span>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getConfidenceColor(recording.confidence)}`}
                  >
                    {getConfidenceLabel(recording.confidence)} Confidence
                  </Badge>
                  
                  <span>{formatDate(recording.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(recording.transcription);
                    toast.success('Transcription copied to clipboard');
                  }}
                  title="Copy transcription"
                >
                  <Download className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={() => {
                    // In production, implement delete functionality
                    toast('Delete functionality would be implemented here');
                  }}
                  title="Delete recording"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
