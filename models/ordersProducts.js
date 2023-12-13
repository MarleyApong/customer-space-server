const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const OrdersProducts = sequelize.define('Orders_Products', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      idOrder: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idProduct: {
         type: DataTypes.STRING(64),
         allowNull: false
      }
   }, { paranoid: true })

   return OrdersProducts
}