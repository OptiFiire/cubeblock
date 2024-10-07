const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '/databases/cooldowns.sqlite'),
    logging: false
});

const Cooldown = sequelize.define('Cooldown', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    user: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    expires: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

(async () => {
    await sequelize.sync();
})();

module.exports = Cooldown
