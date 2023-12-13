"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable("Customers", {
         id: {
            type: Sequelize.STRING(64),
            primaryKey: true,
            allowNull: false,
         },
         name: {
            type: Sequelize.STRING,
         },
         phone: {
            type: Sequelize.STRING(25),
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
      });
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable("Customers");
   },
};
