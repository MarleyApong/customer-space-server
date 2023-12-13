'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      idRole: {
        type: Sequelize.SMALLINT(1),
        allowNull: false,
        references: {
          model: 'Roles',
          Key: 'id'
        }
      },
      idEnv: {
        type: Sequelize.SMALLINT(1),
        allowNull: false,
        references: {
          model: 'Envs',
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
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(100)
      },
      phone: {
        type: Sequelize.STRING(15)
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true  // VALIDATE EMAIL DATA 
      }
      },
      password: {
        type: Sequelize.STRING(64),
        allowNull: false,
        s: /^[0-9a-f]{64}$/i // CONSTRAINT PASSWORD
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};