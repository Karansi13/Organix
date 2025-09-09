import mongoose from 'mongoose';

const CanvasDrawingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  todoId: {
    type: String,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: String,
    required: true,
  },
  preview: {
    type: String, // Base64 image data
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CanvasDrawingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

CanvasDrawingSchema.index({ userId: 1, todoId: 1 });
CanvasDrawingSchema.index({ userId: 1, createdAt: -1 });

export const CanvasDrawing = mongoose.models.CanvasDrawing || mongoose.model('CanvasDrawing', CanvasDrawingSchema);
