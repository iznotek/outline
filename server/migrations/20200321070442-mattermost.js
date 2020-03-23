'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('teams', 'mattermostId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('teams', 'mattermostData', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('teams', 'mattermostId');
    await queryInterface.removeColumn('teams', 'mattermostData');
  }
};