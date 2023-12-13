const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const UsersSurveys = sequelize.define('Users_Surveys', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idUser: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idSurvey: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
   }, { paranoid: true })

   return UsersSurveys
}