const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Products = sequelize.define('Products', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(20),
         allowNull: false
      },
      price: {
         type: DataTypes.FLOAT(10),
         allowNull: false
      },
      category: {
         type: DataTypes.STRING(30)
      }
   }, { paranoid: true })

   return Products
}