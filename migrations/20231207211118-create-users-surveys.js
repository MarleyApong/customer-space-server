'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users_Surveys', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      idUser: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Users',
          Key: 'id'
        }
      },
      idSurver: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Surveys',
          Key: 'id'
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
    await queryInterface.dropTable('Users_Surveys');
  }
};