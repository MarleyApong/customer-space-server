'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Questions_Answers', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      idQuestion: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Questions',
          Key: 'id'
        }
      },
      idAnswer: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'Answers',
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
    await queryInterface.dropTable('Questions_Answers');
  }
};