

import {
  getAllUsers,
  loginUser,
  registerUser,
  getUserSemesterData,
  getUserInfo
} from '../services/user.service.js';
import { getUserPersonalDetails } from '../services/user.service.js';
// mongoose import removed
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
  const USN = req.body.USN || req.body.usn || req.body.username;
  const password = req.body.password;
  try {
    if (!USN || !password) return res.status(400).json({ message: 'USN and password are required' });
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
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login', error: err.message || err });
  }
};




export const register = async (req, res) => {
  const USN = req.body.USN || req.body.usn || req.body.username;
  const password = req.body.password;
  try {
    if (!USN || !password) return res.status(400).json({ message: 'USN and password are required' });
    await registerUser(USN, password);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({
      message: 'Error registering user',
      error: err.message || err
    });
  }
};




export const getInfo = async(req,res)=> {
  try {
    const opts = {
      semester: req.query.semester,
      collectionName: req.query.collection
    };
    const user = await getUserInfo(req.params.USN, opts);
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
    const opts = { semester: req.query.semester, collectionName: req.query.collection };
    const user = await getUserGrades(req.params.USN, opts);
    if(!user || (Array.isArray(user) && user.length === 0)) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};






export const getAttendance = async(req,res)=> {
  try {
    const opts = { semester: req.query.semester, collectionName: req.query.collection };
    const user = await getUserAttendance(req.params.USN, opts);
    if(!user || (Array.isArray(user) && user.length === 0)) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};






export const getAcademic = async(req,res)=> {
  try {
    const opts = { semester: req.query.semester, collectionName: req.query.collection };
    const user = await getUserAcademic(req.params.USN, opts);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Personal details only from personal_information
export const getPersonalDetails = async (req, res) => {
  try {
    const { USN } = req.params;
    if (!USN) return res.status(400).json({ message: 'USN is required' });
    // Enforce that the path USN matches the token's USN (student can only access their own data)
    if (!req.user || !req.user.USN) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    const pathUsn = String(USN).toLowerCase();
    const tokenUsn = String(req.user.USN).toLowerCase();
    if (pathUsn !== tokenUsn) {
      return res.status(403).json({ message: 'USN mismatch: token does not match requested USN' });
    }
    const doc = await getUserPersonalDetails(USN);
    if (!doc) return res.status(404).json({ message: 'Personal details not found' });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching personal details', error: err.message || err });
  }
};

// New unified endpoint handler: returns semester data for a USN.
export const getSemesterData = async (req, res) => {
  try {
    const { USN } = req.params;
    const semester = req.query.semester; // required
    const trh = req.query.trh; // optional lower semester

    if (!semester) {
      return res.status(400).json({ message: 'semester query parameter is required' });
    }

    const lower = trh ? Number(trh) : Number(semester);
    const upper = Number(semester);
    if (Number.isNaN(lower) || Number.isNaN(upper)) {
      return res.status(400).json({ message: 'semester and trh must be numbers' });
    }
    if (lower > upper) {
      return res.status(400).json({ message: 'trh (lower semester) must be <= semester' });
    }

    const data = await getUserSemesterData(USN, upper, lower);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No semester data found for this USN' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching semester data', error: err.message || err });
  }
};

// Debug: return a small sample of documents from a given collection name
// debug functions removed


