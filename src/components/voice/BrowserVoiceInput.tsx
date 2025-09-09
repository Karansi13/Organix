'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BrowserVoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
  language?: string;
}

export default function BrowserVoiceInput({ 
  onTranscription, 
  disabled = false,
  className,
  language = 'en-US'
}: BrowserVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          toast.success('Listening... speak now!');
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setInterimTranscript(interimTranscript);
          
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          switch (event.error) {
            case 'no-speech':
              toast.error('No speech detected. Please try again.');
              break;
            case 'audio-capture':
              toast.error('Microphone not available. Please check permissions.');
              break;
            case 'not-allowed':
              toast.error('Microphone permission denied. Please allow microphone access.');
              break;
            default:
              toast.error('Speech recognition error. Please try again.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            onTranscription(transcript.trim());
            setTranscript('');
            setInterimTranscript('');
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscription, transcript]);

  const startListening = () => {
    if (!isSupported || disabled || !recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 text-center p-4">
        Speech recognition is not supported in your browser.
        <br />
        Try using Chrome, Edge, or Safari for voice input.
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Listening Button */}
      <div className="relative">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={cn(
            "w-16 h-16 rounded-full transition-all duration-200",
            isListening && "animate-pulse scale-110"
          )}
        >
          {isListening ? (
            <Square className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {/* Pulsing ring when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping" />
        )}
      </div>

      {/* Status Text */}
      <div className="text-center min-h-[60px]">
        {isListening ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">Listening...</p>
            <p className="text-xs text-gray-400">Click stop when finished</p>
            
            {/* Live Transcript */}
            {(transcript || interimTranscript) && (
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs max-w-sm">
                <span className="font-medium">{transcript}</span>
                <span className="text-gray-500 italic">{interimTranscript}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Click to start voice input</p>
            <p className="text-xs text-gray-400">
              Powered by browser speech recognition
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
