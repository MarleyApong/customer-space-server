const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
   const AnswersCustomers = sequelize.define('Answers_Customers', {
      id: {
         type: DataTypes.STRING(64),
         primaryKey: true,
      },
      idAnswer: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
      idCustomer: {
         type: DataTypes.STRING(64),
         allowNull: false
      },
   }, { paranoid: true })

   return AnswersCustomers
}