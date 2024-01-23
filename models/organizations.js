const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Organizations = sequelize.define('Organizations', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      idStatus: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(100),
         allowNull: false
      },
      description: {
         type: DataTypes.STRING,
         allowNull: false
      },
      picture: {
         type: DataTypes.STRING,
      },
      city: {
         type: DataTypes.STRING(30),
         allowNull: false
      },
      neighborhood: {
         type: DataTypes.STRING(50),
         allowNull: false
      },
      phone: {
         type: DataTypes.STRING(15),
         allowNull: false
      }
   }, { paranoid: true })

   return Organizations
}
