const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
   const Roles = sequelize.define("Roles", {
      id: {
         type: DataTypes.SMALLINT(1),
         primaryKey: true,
         autoIncrement: true,
      },
      name: {
         type: DataTypes.STRING(15),
         allowNull: false,
      },
   }, { freezeTableName: true })

   return Roles
}