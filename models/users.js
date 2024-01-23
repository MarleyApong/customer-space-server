const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const Users = sequelize.define('Users', {
        id: {
            type: DataTypes.STRING(64),
            primaryKey: true,
        },
        idRole: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        idEnv: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        idStatus: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(100),
            defaultValue: '',
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(15),
            defaultValue: '',
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(45),
            defaultValue: '',
            allowNull: false,
            validate: {
                isEmail: true  // VALIDATE EMAIL DATA 
            }
        },
        password: {
            type: DataTypes.STRING(64),
            defaultValue: '',
            allowNull: false,
            is: /^[0-9a-f]{64}$/i // CONSTRAINT PASSWORD
        }
    }, { paranoid: true }) // SOFTDELETE

    return Users
}