'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Answers_Customers', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      idCustomer: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      idAnswer: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Answers',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Answers_Customers');
  }
};