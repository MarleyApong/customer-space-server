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
            type: DataTypes.SMALLINT(1),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(30),
            defaultValue: '',
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: true
        },
        category: {
            type: DataTypes.STRING(30),
            defaultValue: '',
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(15),
            defaultValue: '',
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
            validate: {
                isEmail: true  // VALIDATE EMAIL DATA 
            }
        },
        city: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            allowNull: false
        },
        neighborhood: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            allowNull: false
        }
    }, { paranoid: true })

    return Companies
}