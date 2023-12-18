const { DataTypes } = require('sequelize')
module.exports = (sequelize) => {
    const Answers = sequelize.define('Answers', {
        id: {
            type: DataTypes.STRING(64),
            primaryKey: true,
        },
        note: {
            type: DataTypes.SMALLINT(1),
            defaultValue: 0,
            allowNull: false
        },
        suggestion: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: true
        }
    }, { paranoid: true })

    return Answers
}
