import mongoose from 'mongoose';

const VoiceRecordingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  todoId: {
    type: String,
  },
  originalText: {
    type: String,
    required: true,
  },
  transcription: {
    type: String,
    required: true,
  },
  audioData: {
    type: String, // Base64 encoded audio
    required: true,
  },
  audioFormat: {
    type: String,
    default: 'webm',
  },
  duration: {
    type: Number, // Duration in seconds
  },
  language: {
    type: String,
    default: 'en',
  },
  confidence: {
    type: Number, // Transcription confidence score
    min: 0,
    max: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

VoiceRecordingSchema.index({ userId: 1, createdAt: -1 });
VoiceRecordingSchema.index({ todoId: 1 });

export const VoiceRecording = mongoose.models.VoiceRecording || mongoose.model('VoiceRecording', VoiceRecordingSchema);
