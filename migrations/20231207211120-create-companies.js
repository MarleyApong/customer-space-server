'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
        allowNull: false
      },
      idStatus: {
        type: Sequelize.SMALLINT(1),
        allowNull: false,
        references: {
          model: 'Status',
          key: 'id'
        }
      },
      idOrganization: {
        type: Sequelize.STRING(64),
        allowNull: false,
        references: {
          model: 'OrganiZations',
          key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING(50)
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true  // VALIDATE EMAIL DATA 
      }
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      neigbhborhood: {
        type: Sequelize.STRING,
        allowNull: false
      },
      webpage: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Companies');
  }
};