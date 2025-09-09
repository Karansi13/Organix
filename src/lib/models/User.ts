import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  imageUrl: String,
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date,
  },
  preferences: {
    googleCalendarSync: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
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

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
