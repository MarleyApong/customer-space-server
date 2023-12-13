const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const OrdersTables = sequelize.define('Orders_Tables', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      idOrder: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idTable: {
         type: DataTypes.STRING(64),
         allowNull: false
      }
   }, { paranoid: true })

   return OrdersTables
}