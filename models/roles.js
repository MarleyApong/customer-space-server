const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
   const Roles = sequelize.define("Roles", {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(15),
         allowNull: false,
      },
   }, { freezeTableName: true })

   return Roles
}