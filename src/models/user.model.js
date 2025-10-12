import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    USN: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },

  { collection: "users" }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;