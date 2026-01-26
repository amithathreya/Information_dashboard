import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  {
    timestamps: true // Add timestamps for better tracking
  }
);

// Create index on username for faster lookups
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

export default User;