const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('etudiant', 'professeur'),
    allowNull: false,
    defaultValue: 'etudiant'
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('actif', 'inactif'),
    allowNull: false,
    defaultValue: 'inactif' 
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password,10);
    }
  }
});

module.exports = User;
