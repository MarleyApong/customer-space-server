const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Customers = sequelize.define('Customers', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      name: {
         type: DataTypes.STRING(30),
      },
      phone: {
         type: DataTypes.STRING(30),
      }
   }, { paranoid: true })

   return Customers
}