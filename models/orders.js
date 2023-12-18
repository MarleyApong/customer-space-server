const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Orders = sequelize.define('Orders', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
      allowNull: false
    },
    idUser: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    idTable: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    }
  }, { paranoid: true })

  return Orders
}