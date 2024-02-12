const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Tables = sequelize.define('Tables', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      idCompany: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      tableNumber: {
         type: DataTypes.STRING(10),
         allowNull: false
      },
      webPage: {
         type: DataTypes.STRING,
         allowNull: false
      }
   }, { paranoid: true })

   return Tables
}