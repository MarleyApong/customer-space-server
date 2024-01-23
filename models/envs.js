const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const Envs = sequelize.define('Envs', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
         allowNull: false
      },
      name: {
         type: DataTypes.STRING(15),
         defaultValue: '',
         allowNull: false
      }
   }, { freezeTableName: true })

   return Envs
}