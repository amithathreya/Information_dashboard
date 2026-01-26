import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';


export const getUsers = async (req, res) => {
  try {
    // Add pagination support to prevent memory issues with large datasets
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, 'username')
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance when not modifying documents

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error(`Error fetching users: ${err.message}`);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};


export const login = async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid input format' });
  }

  try {
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    logger.error(`Error during login for user ${username}: ${err.message}`);
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
};

export const register = async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid input format' });
  }

  // Basic validation rules
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    logger.error(`Error registering user ${username}: ${err.message}`);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};