const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const UsersCompanies = sequelize.define('Users_Organizations', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idUser: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idOrganization: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
   }, { paranoid: true })

   return UsersCompanies
}