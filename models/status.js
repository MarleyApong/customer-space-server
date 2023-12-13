const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
   const Status = sequelize.define("Status", {
      id: {
         type: DataTypes.SMALLINT(1),
         primaryKey: true,
         autoIncrement: true,
      },
      name: {
         type: DataTypes.STRING(15),
         defaultValue: "",
         allowNull: false,
      },
   }, { freezeTableName: true })

   return Status
}