import express from 'express';
import path from 'path';
import 'bcrypt';
import cors from 'cors';

const users = [
  { username: "amith", password: "123" }
];

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json(users);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && user.password === password) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});