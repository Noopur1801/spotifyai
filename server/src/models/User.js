import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['listener', 'co_dj', 'host', 'admin'],
    default: 'listener'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;