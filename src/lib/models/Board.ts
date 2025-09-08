import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: String, required: true },
  collaborators: [{
    userId: { type: String },
    email: { type: String },
    permission: { type: String, enum: ['read', 'write'], default: 'read' }
  }],
  isPublic: { type: Boolean, default: false }
}, {
  timestamps: true
});

BoardSchema.index({ userId: 1 });
BoardSchema.index({ 'collaborators.userId': 1 });

export const Board = mongoose.models.Board || mongoose.model('Board', BoardSchema);
