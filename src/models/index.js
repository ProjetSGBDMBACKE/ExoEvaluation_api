const User = require('./User');
const Exercise = require('./Exercise');
const Submission = require('./Submission');

// Définition des relations
User.hasMany(Exercise, { foreignKey: 'createdBy' });
Exercise.belongsTo(User, { foreignKey: 'createdBy' });

User.hasMany(Submission, { foreignKey: 'studentId' });
Submission.belongsTo(User, { foreignKey: 'studentId' });

Exercise.hasMany(Submission, { foreignKey: 'exerciseId' });
Submission.belongsTo(Exercise, { foreignKey: 'exerciseId' });

module.exports = {
  User,
  Exercise,
  Submission
};