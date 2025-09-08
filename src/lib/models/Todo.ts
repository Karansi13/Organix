import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['backlog', 'in-progress', 'completed'], 
    default: 'backlog' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  dueDate: { type: Date },
  tags: [{ type: String }],
  userId: { type: String, required: true },
  aiGenerated: { type: Boolean, default: false },
  calendarEventId: { type: String },
  attachments: [{
    type: { type: String, enum: ['canvas', 'file'] },
    url: { type: String },
    name: { type: String }
  }],
  position: { type: Number, default: 0 }, // For drag and drop ordering
}, {
  timestamps: true
});

TodoSchema.index({ userId: 1, status: 1 });
TodoSchema.index({ userId: 1, dueDate: 1 });
TodoSchema.index({ userId: 1, createdAt: -1 });

export const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);
