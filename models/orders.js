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
    idStatus: {
      type: DataTypes.STRING(64)
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, { paranoid: true })

  return Orders
}