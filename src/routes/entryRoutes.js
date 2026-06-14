import express from 'express';
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  searchEntries,
  getStats
} from '../controllers/entryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/search', protect, searchEntries);
router.get('/stats', protect, getStats);

router.get('/', protect, getEntries)
router.post('/', protect, createEntry)

router.get('/:id', protect, getEntry)
router.put('/:id', protect, updateEntry)
router.delete('/:id', protect, deleteEntry)


export default router;
