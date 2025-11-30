import { listStudents, listRawRecords, updateSemesterSubjects, countDocs, loginAdmin, registerAdmin, updateCollectionRecord, updatePersonalInfo } from '../services/admin.service.js';
import { signToken } from '../utils/jwt.js';

export async function getStudents(req, res) {
  try {
    const { semester, collection: collectionName, debug, USN } = req.query;
    if (!semester && !collectionName) return res.status(400).json({ message: 'semester (or collection) is required' });

    if (debug === 'raw') {
      const raw = await listRawRecords({ semester, collectionName });
      return res.status(200).json(raw);
    }

    const students = await listStudents({ semester, collectionName, USN });
    if (debug === '1' || debug === 'true') {
      const totalDocs = await countDocs({ semester, collectionName });
      return res.status(200).json({ meta: { totalDocs, grouped: students.length, semester, collectionName }, students });
    }
    return res.status(200).json(students);
  } catch (err) {
    console.error('getStudents error:', err);
    return res.status(500).json({ message: 'Error fetching students', error: err.message || err });
  }
}

export async function patchUpdateSemesterSubjects(req, res) {
  try {
    const { USN } = req.params;
    const { semester } = req.query;
    const { subjects } = req.body || {};
    if (!USN) return res.status(400).json({ message: 'USN is required' });
    if (!semester) return res.status(400).json({ message: 'semester is required' });
    if (!Array.isArray(subjects)) return res.status(400).json({ message: 'subjects array is required in body' });

    const updated = await updateSemesterSubjects(USN, semester, subjects);
    return res.status(200).json({ message: 'Updated successfully', data: updated });
  } catch (err) {
    console.error('patchUpdateSemesterSubjects error:', err);
    return res.status(500).json({ message: 'Error updating subjects', error: err.message || err });
  }
}

// Admin authentication
export async function adminLogin(req, res) {
  try {
    const username = req.body.username || req.body.user || req.body.admin;
    const password = req.body.password;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const result = await loginAdmin(username, password);
    if (!result.success) {
      return res.status(401).json({ message: 'Invalid credentials', reason: result.reason });
    }
    const token = signToken({ username, role: 'admin' });
    return res.status(200).json({ message: 'Login successful', token, redirect: '/admin' });
  } catch (err) {
    console.error('adminLogin error:', err);
    return res.status(500).json({ message: 'Error during admin login', error: err.message || err });
  }
}

export async function adminRegister(req, res) {
  try {
    const username = req.body.username || req.body.user || req.body.admin;
    const password = req.body.password;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    await registerAdmin(username, password);
    return res.status(201).json({ message: 'Admin registered' });
  } catch (err) {
    console.error('adminRegister error:', err);
    return res.status(500).json({ message: 'Error registering admin', error: err.message || err });
  }
}

export async function patchPersonalInfo(req, res) {
  try {
    const { USN } = req.params;
    const updates = req.body;
    if (!USN) return res.status(400).json({ message: 'USN is required' });
    if (!updates || Object.keys(updates).length === 0) return res.status(400).json({ message: 'updates body is required' });

    const doc = await updatePersonalInfo(USN, updates);
    return res.status(200).json({ message: 'Updated successfully', data: doc });
  } catch (err) {
    console.error('patchPersonalInfo error:', err);
    const status = err.message === 'Document not found' ? 404 : 500;
    return res.status(status).json({ message: err.message || 'Error updating personal info' });
  }
}
