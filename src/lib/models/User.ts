import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  imageUrl: { type: String },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true },
    googleCalendarSync: { type: Boolean, default: false },
    aiSuggestions: { type: Boolean, default: true }
  },
  googleTokens: {
    accessToken: { type: String },
    refreshToken: { type: String },
    expiryDate: { type: Date }
  }
}, {
  timestamps: true
});

UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
