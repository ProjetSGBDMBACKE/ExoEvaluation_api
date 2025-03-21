const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('en_attente', 'évalué', 'erreur'),
    defaultValue: 'en_attente'
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  exerciseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Exercises',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Submission;