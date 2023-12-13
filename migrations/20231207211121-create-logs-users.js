'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs_Users', {
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
          key: 'id'
        }
      },
      idLogoutType: {
        type: Sequelize.SMALLINT(1),
        allowNull: false,
        references: {
          model: 'Logout_Types',
          key: 'id'
        }
      },
      login: {
        type: Sequelize.DATE,
        allowNull: false
      },
      logout: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Logs_Users');
  }
};