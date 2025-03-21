const { z } = require('zod');

const authSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['student', 'professor'], {
    errorMap: () => ({ message: 'Le rôle doit être soit "student" soit "professor"' })
  }).optional()
});

const exerciseSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  expectedSolution: z.string().min(1, 'La solution attendue est requise')
});

const submissionSchema = z.object({
  exerciseId: z.string().uuid('ID d\'exercice invalide'),
  solution: z.string().min(1, 'La solution est requise')
});

const evaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().min(1, 'Le feedback est requis')
});

const validateAuth = (req, res, next) => {
  try {
    authSchema.parse(req.body);
    next();
  } catch (error) {
    next({
      type: 'validation',
      errors: error.errors
    });
  }
};

const validateExercise = (req, res, next) => {
  try {
    exerciseSchema.parse(req.body);
    next();
  } catch (error) {
    next({
      type: 'validation',
      errors: error.errors
    });
  }
};

const validateSubmission = (req, res, next) => {
  try {
    submissionSchema.parse(req.body);
    next();
  } catch (error) {
    next({
      type: 'validation',
      errors: error.errors
    });
  }
};

const validateEvaluation = (req, res, next) => {
  try {
    evaluationSchema.parse(req.body);
    next();
  } catch (error) {
    next({
      type: 'validation',
      errors: error.errors
    });
  }
};

module.exports = {
  validateAuth,
  validateExercise,
  validateSubmission,
  validateEvaluation
};