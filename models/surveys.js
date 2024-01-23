const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Surveys = sequelize.define('Surveys', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idCompany: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idStatus: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(100),
         defaultValue: '',
         allowNull: true
      }
   }, { paranoid: true })

   return Surveys
}