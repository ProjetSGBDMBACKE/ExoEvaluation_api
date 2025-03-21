const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.type === 'validation') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.errors
    });
  }

  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = {
  errorHandler
};