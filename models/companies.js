const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const Companies = sequelize.define('Companies', {
        id: {
            type: DataTypes.STRING(64),
            primaryKey: true,
        },
        idOrganization: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        idStatus: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        picture: {
            type: DataTypes.STRING,
        },
        category: {
            type: DataTypes.STRING(50)
        },
        phone: {
            type: DataTypes.STRING(15),
            defaultValue: '',
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true  // VALIDATE EMAIL DATA 
            }
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        neighborhood: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        webpage: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, { paranoid: true })

    return Companies
}