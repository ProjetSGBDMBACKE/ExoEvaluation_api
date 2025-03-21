const express = require('express');
const authRoutes = require('./auth.routes');
const exerciseRoutes = require('./exercise.routes');
const submissionRoutes = require('./submission.routes');
// const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/submissions', submissionRoutes);
// router.use('/users', userRoutes);

module.exports = router;