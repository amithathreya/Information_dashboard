import users from '../models/user.model.js';

export const getUsers = (req, res) => {
  res.status(200).json(users);
};

export const login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && user.password === password) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};