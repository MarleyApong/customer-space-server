const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Orders = sequelize.define('Orders', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      allowNull: false
    },
    idUser: {
      type: DataTypes.STRING(64)
    },
    idTable: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    name: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      autoIncrementStartingValue: 1000
    }
  }, { paranoid: true })

  return Orders
}