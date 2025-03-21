const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('facile', 'moyenne', 'difficile'),
    allowNull: false,
    defaultValue: 'moyenne'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  fileUrl: {  
    type: DataTypes.STRING,
    allowNull: true  
  },
  fileUrl: {  
    type: DataTypes.STRING,
    allowNull: true  
  }
}, {
  timestamps: true
});

module.exports = Exercise;
