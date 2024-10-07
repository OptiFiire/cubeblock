const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '/databases/tickets.sqlite'),
    logging: false
});

const Ticket = sequelize.define('Ticket', {
    owner: {
        type: DataTypes.JSON,
        allowNull: false
    },
    openedTime: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    channel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    panel: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

(async () => {
    await sequelize.sync();
})();

module.exports = Ticket;
