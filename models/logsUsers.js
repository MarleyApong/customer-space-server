const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

module.exports = (sequelize) => {
   const LogUsers = sequelize.define('Log_Users', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true
      },
      idUser: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      login: {
         type: DataTypes.DATE,
      },
      logout: {
         type: DataTypes.DATE,
      }
   }, { paranoid: true })

   return LogUsers
}