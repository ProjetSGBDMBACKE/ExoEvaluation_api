const { Submission, Exercise } = require('../models');
const { logger } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Fonction pour créer un répertoire automatiquement pour chaque étudiant
const createStudentFolder = (userId) => {
  const dirPath = path.join(__dirname, '..', 'uploads', 'students', userId.toString());

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
};

// Création d'une soumission
const createSubmission = async (req, res) => {
  try {
    const { exerciseId } = req.body;
    console.log(exerciseId);
    const exercise = await Exercise.findByPk(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!['.pdf', '.txt'].includes(fileExtension)) {
      return res.status(400).json({ message: "Le fichier doit être au format PDF ou TXT" });
    }

    const dirPath = createStudentFolder(req.user.id);
    const filePath = path.join(dirPath, req.file.originalname);

    fs.writeFileSync(filePath, req.file.buffer);
    const fileUrl = `/uploads/students/${req.user.id}/${req.file.originalname}`;

    const submission = await Submission.create({
      fileUrl,
      studentId: req.user.id,
      exerciseId,
      status: 'en attente'
    });

    res.status(201).json({ message: 'Soumission créée avec succès', submission });
  } catch (error) {
    logger.error('Erreur lors de la création de la soumission:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la soumission' });
  }
};

// Évaluation d'une soumission
const evaluateSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    const exercise = await Exercise.findByPk(submission.exerciseId);
    if (exercise.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à évaluer cette soumission' });
    }

    await submission.update({ score, feedback, status: 'évalué' });

    res.json({ message: 'Soumission évaluée avec succès', submission });
  } catch (error) {
    logger.error("Erreur lors de l'évaluation de la soumission:", error);
    res.status(500).json({ message: "Erreur lors de l'évaluation de la soumission" });
  }
};

// Récupération des soumissions pour un exercice
const getSubmissionsByExercise = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { exerciseId: req.params.exerciseId },
      include: ['Exercise']
    });
    res.json(submissions);
  } catch (error) {
    logger.error('Erreur lors de la récupération des soumissions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des soumissions' });
  }
};

// Récupération des soumissions d'un étudiant
const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { studentId: req.user.id },
      include: ['Exercise']
    });
    res.json(submissions);
  } catch (error) {
    logger.error('Erreur lors de la récupération des soumissions:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des soumissions' });
  }
};

module.exports = {
  createSubmission,
  evaluateSubmission,
  getSubmissionsByExercise,
  getStudentSubmissions
};
