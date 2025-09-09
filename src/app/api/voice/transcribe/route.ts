import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { VoiceRecording } from '@/lib/models/VoiceRecording';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Mock OpenAI Whisper API call (replace with actual implementation)
async function transcribeAudioWithWhisper(audioBuffer: Buffer): Promise<string> {
  // This is a mock implementation
  // In production, integrate with:
  // 1. OpenAI Whisper API
  // 2. Google Speech-to-Text API
  // 3. Azure Speech Services
  // 4. AWS Transcribe
  
  try {
    // Example with OpenAI Whisper API
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const transcription = await openai.audio.transcriptions.create({
    //   file: audioBuffer,
    //   model: "whisper-1",
    //   language: "en", // optional
    // });
    // return transcription.text;

    // For now, return a mock response
    // You can also use browser-based speech recognition as fallback
    return "Please integrate with a speech-to-text service like OpenAI Whisper";
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

// Alternative: Browser-based speech recognition (for demonstration)
async function mockTranscription(audioBuffer: Buffer): Promise<string> {
  // This is a mock implementation for demonstration
  // In a real scenario, you'd process the audio buffer
  const mockResponses = [
    "Create a task to buy groceries for tomorrow",
    "Schedule a meeting with the team next week", 
    "Remind me to call mom at 3 PM",
    "Add a high priority task to finish the project proposal",
    "Create a task to book a doctor's appointment",
    "Buy groceries this weekend",
    "Complete the quarterly report by Friday",
    "Schedule dentist appointment for next month",
    "Review the budget proposal with high priority",
    "Plan team meeting for project kickoff"
  ];
  
  // Return a random mock response (in production, process the actual audio)
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Validate file size (max 25MB)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large' }, { status: 400 });
    }

    // Validate audio format
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mp3'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 400 });
    }

    let transcription: string;

    try {
      // Try to use proper transcription service
      if (process.env.OPENAI_API_KEY) {
        transcription = await transcribeAudioWithWhisper(audioBuffer);
      } else {
        // Fallback to mock for demonstration
        transcription = await mockTranscription(audioBuffer);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    // Store the audio and transcription
    try {
      await connectToDatabase();
      
      // Convert audio buffer to base64 for storage
      const audioBase64 = audioBuffer.toString('base64');
      
      const voiceRecording = new VoiceRecording({
        userId,
        transcription,
        originalText: transcription,
        audioData: audioBase64,
        audioFormat: audioFile.type.split('/')[1] || 'webm',
        duration: Math.floor(audioBuffer.length / 16000), // Rough estimate
        language: 'en',
        confidence: 0.8 // Mock confidence score
      });
      
      await voiceRecording.save();
    } catch (dbError) {
      console.error('Error saving voice recording:', dbError);
      // Continue even if DB save fails
    }

    return NextResponse.json({
      transcription,
      audioSize: audioBuffer.length,
      duration: audioFile.type.includes('webm') ? 'estimated' : 'unknown'
    });

  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint to retrieve stored transcriptions
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get user's voice recordings
    const recordings = await VoiceRecording.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('-audioData') // Exclude audio data for performance
      .lean();
      
    const total = await VoiceRecording.countDocuments({ userId });

    return NextResponse.json({
      recordings,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
