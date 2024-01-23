const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Notifications = sequelize.define('Notifications', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      idOrder: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idStatus: {
         type: DataTypes.STRING(64),
         allowNull: false
      }
   }, { paranoid: true })

   return Notifications
}