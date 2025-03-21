const { Exercise } = require('../models');
const { logger } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Fonction pour créer un répertoire automatiquement pour chaque professeur
const createProfessorFolder = (userId) => {
  const dirPath = path.join(__dirname, '..', 'uploads', 'professors', userId.toString());

  // Vérifie si le répertoire existe, sinon il le crée
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
};

// Méthode de création d'un exercice avec un fichier (stockage local)
const createExercise = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé' });
    }

    // Vérification de l'extension du fichier
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.pdf' && fileExtension !== '.txt') {
      return res.status(400).json({ message: 'Le fichier doit être au format PDF ou TXT' });
    }

    // Création du répertoire pour le professeur s'il n'existe pas
    const dirPath = createProfessorFolder(req.user.id);

    // Définir le chemin du fichier dans le répertoire du professeur
    const filePath = path.join(dirPath, req.file.originalname);

    // Sauvegarde du fichier dans le répertoire du professeur
    fs.writeFileSync(filePath, req.file.buffer);

    // Créer l'URL d'accès au fichier local (si tu veux renvoyer cette URL dans la réponse)
    const fileUrl = `/uploads/professors/${req.user.id}/${req.file.originalname}`;

    // Création de l'exercice dans la base de données avec l'URL du fichier local
    const exercise = await Exercise.create({
      title,
      description,
      difficulty,
      fileUrl,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: 'Exercice créé avec succès',
      exercise,
    });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'exercice' });
  }
};

// Méthode pour récupérer tous les exercices
const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      include: ['User'],
    });
    res.json(exercises);
  } catch (error) {
    logger.error('Erreur lors de la récupération des exercices:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
  }
};

// Méthode pour récupérer un exercice par ID
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id, {
      include: ['User'],
    });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }
    res.json(exercise);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'exercice' });
  }
};

// Méthode de mise à jour d'un exercice
const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }

    if (exercise.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cet exercice' });
    }

    const { title, description, difficulty, expectedSolution } = req.body;
    
    let fileUrl = exercise.fileUrl; // Conserver l'ancien fichier si aucun nouveau n'est envoyé
    if (req.file) {
      // Mise à jour du fichier
      const dirPath = createProfessorFolder(req.user.id);
      const filePath = path.join(dirPath, req.file.originalname);

      // Supprime l'ancien fichier si nécessaire (optionnel)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Sauvegarde du nouveau fichier
      fs.writeFileSync(filePath, req.file.buffer);

      // Mettre à jour l'URL du fichier local
      fileUrl = `/uploads/professors/${req.user.id}/${req.file.originalname}`;
    }

    await exercise.update({
      title,
      description,
      difficulty,
      expectedSolution,
      fileUrl,
    });

    res.json({
      message: 'Exercice mis à jour avec succès',
      exercise,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'exercice' });
  }
};

// Méthode de suppression d'un exercice
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }

    if (exercise.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cet exercice' });
    }

    // Supprimer le fichier local associé
    const filePath = path.join(__dirname, '..', 'uploads', 'professors', req.user.id.toString(), path.basename(exercise.fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await exercise.destroy();
    res.json({ message: 'Exercice supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice' });
  }
};

module.exports = {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
};
