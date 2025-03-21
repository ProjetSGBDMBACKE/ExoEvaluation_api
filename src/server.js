const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const session = require('express-session');
const sequelize = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const { logger } = require('./utils/logger');

require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: true, 
  cookie: { secure: false } 
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});

app.use(limiter);

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT;

sequelize.sync()
.then(() => {
  app.listen(PORT, () => {
    logger.info(`Serveur démarré sur le port ${PORT}`);
    logger.info('Connexion à la base de données établie avec succès');
  });
})
.catch(err => {
  logger.error('Erreur de connexion à la base de données:', err);
  process.exit(1);
});