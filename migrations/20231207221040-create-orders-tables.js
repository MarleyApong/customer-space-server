'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders_Tables', {
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
      idTable: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Tables',
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
    await queryInterface.dropTable('Orders_Tables');
  }
};