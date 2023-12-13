'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Answers', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false,
      },
      idQuestion: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Questions',
          key: 'id'
        }
      },
      note: {
        type: Sequelize.SMALLINT,
        defaultValue: 5,
        allowNull: false
      },
      suggestion: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Answers');
  }
};