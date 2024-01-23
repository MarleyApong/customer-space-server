const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
   const Status = sequelize.define("Status", {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(15),
         defaultValue: "",
         allowNull: false,
      },
   }, { freezeTableName: true })

   return Status
}