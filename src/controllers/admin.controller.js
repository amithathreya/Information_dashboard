import { listStudents, listRawRecords, updateSemesterSubjects, countDocs } from '../services/admin.service.js';
import { getRecordModel } from '../models/record.model.js';

export async function getStudents(req, res) {
  try {
    const { semester, collection: collectionName, debug } = req.query;
    if (!semester && !collectionName) return res.status(400).json({ message: 'semester (or collection) is required' });

    if (debug === 'raw') {
      const raw = await listRawRecords({ semester, collectionName });
      return res.status(200).json(raw);
    }

    const students = await listStudents({ semester, collectionName });
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
