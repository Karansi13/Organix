import mongoose from 'mongoose';

const CanvasDrawingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  todoId: { type: String },
  data: { type: String, required: true }, // Fabric.js canvas JSON
  name: { type: String, required: true },
  preview: { type: String }, // Base64 preview image
}, {
  timestamps: true
});

CanvasDrawingSchema.index({ userId: 1 });
CanvasDrawingSchema.index({ todoId: 1 });

export const CanvasDrawing = mongoose.models.CanvasDrawing || mongoose.model('CanvasDrawing', CanvasDrawingSchema);
