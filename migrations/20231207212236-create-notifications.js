'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      idOrder: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Orders',
          Key: 'id'
        }
      },
      idStatus: {
        type: Sequelize.SMALLINT(1),
        allowNull: false,
        references: {
          model: 'Status',
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
    await queryInterface.dropTable('Notifications');
  }
};