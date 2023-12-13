const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Questions = sequelize.define('Questions', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idSurvey: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      name: {
         type: DataTypes.STRING,
         defaultValue: '',
         allowNull: false
      }
   }, { paranoid: true })

   return Questions
}