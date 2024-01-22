const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const UsersCompanies = sequelize.define('Users_Companies', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idUser: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idCompany: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
   })

   return UsersCompanies
}