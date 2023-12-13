const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const QuestionsAnswers = sequelize.define('Questions_Answers', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idQuestion: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idAnswer: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
   }, { paranoid: true })

   return QuestionsAnswers
}