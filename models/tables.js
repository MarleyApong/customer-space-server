const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Tables = sequelize.define('Tables', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      tableNumber: {
         type: DataTypes.STRING(10),
      }
   }, { paranoid: true })

   return Tables
}