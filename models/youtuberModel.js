const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '/databases/youtubers.sqlite'),
    logging: false
});

const Cooldown = sequelize.define('YouTuber', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    user: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    reaction: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastVideo: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

(async () => {
    await sequelize.sync();
})();

module.exports = Cooldown
