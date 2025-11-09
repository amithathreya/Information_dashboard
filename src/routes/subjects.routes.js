import { Router } from 'express';
import { optionalAuthenticateJWT } from '../middlewares/jwt.middleware.js';
import { getRecordModel } from '../models/record.model.js';

const router = Router();

// GET /subjects?semester=8 or /subjects?collection=semester_8
router.get('/', optionalAuthenticateJWT, async (req, res) => {
  try {
    const { semester, collection: collectionName } = req.query;
    if (!semester && !collectionName) return res.status(400).json({ message: 'semester (or collection) is required' });
    const Model = getRecordModel({ semester, collectionName });
    const docs = await Model.find({}).lean();
    res.status(200).json(docs);
  } catch (err) {
    console.error('subjects list error:', err);
    res.status(500).json({ message: 'Error fetching subjects', error: err.message || err });
  }
});

export default router;
