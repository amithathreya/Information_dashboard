

import {
  getAllUsers,
  loginUser,
  registerUser,
  getUserInfo,
  getUserGrades,
  getUserAttendance,
  getUserAcademic
} from '../services/user.service.js';
import { signToken } from '../utils/jwt.js';




export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};




export const login = async (req, res) => {
  const { USN, password } = req.body;
  try {
    const result = await loginUser(USN, password);
    if (result.success) {
      // Fetch user info for payload and response
      const userInfo = await getUserInfo(USN);
      const token = signToken({ USN });
      res.status(200).json({
        message: 'Login successful',
        token,
        user: userInfo
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error during login' });
  }
};




export const register = async (req, res) => {
  const { USN, password } = req.body;
  try {
    await registerUser(USN, password);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user' });
  }
};




export const getInfo = async(req,res)=> {
  try {
    const user = await getUserInfo(req.params.USN);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};





export const getGrades = async(req,res)=> {
  try {
    const user = await getUserGrades(req.params.USN);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};






export const getAttendance = async(req,res)=> {
  try {
    const user = await getUserAttendance(req.params.USN);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};






export const getAcademic = async(req,res)=> {
  try {
    const user = await getUserAcademic(req.params.USN);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};


