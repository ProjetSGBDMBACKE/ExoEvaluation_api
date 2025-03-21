const express = require('express');
const { auth, checkRole } = require('../middleware/auth');
const {
  createSubmission,
  evaluateSubmission,
  getSubmissionsByExercise,
  getStudentSubmissions
} = require('../controllers/submission.controller');

const router = express.Router();

router.post('/', auth, checkRole(['etudiant']), createSubmission);
router.put('/:id/evaluate', auth, checkRole(['professeur']), evaluateSubmission);
router.get('/exercise/:exerciseId', auth, checkRole(['professeur']), getSubmissionsByExercise);
router.get('/student', auth, checkRole(['etudiant']), getStudentSubmissions);

module.exports = router;