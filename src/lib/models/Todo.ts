import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['backlog', 'in-progress', 'completed'],
    default: 'backlog',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  userId: {
    type: String,
    required: true,
    index: true,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  calendarEventId: {
    type: String,
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

TodoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

TodoSchema.index({ userId: 1, status: 1 });
TodoSchema.index({ userId: 1, dueDate: 1 });
TodoSchema.index({ userId: 1, priority: 1 });

export const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);
