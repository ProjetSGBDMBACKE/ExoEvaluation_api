const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, checkRole } = require('../middleware/auth');
const {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
} = require('../controllers/exercise.controller');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', auth, checkRole(['professeur']), upload.single('file'), createExercise);
router.get('/', auth, getAllExercises);
router.get('/:id', auth, getExerciseById);
router.put('/:id', auth, checkRole(['professeur']), upload.single('file'), updateExercise);
router.delete('/:id', auth, checkRole(['professeur']), deleteExercise);

module.exports = router;
