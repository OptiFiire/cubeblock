const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '/databases/staffApplications.sqlite'),
    logging: false
});

const StaffApplication = sequelize.define('StaffApplication', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    submitter: {
        type: DataTypes.JSON,
        allowNull: false
    },
    answers: {
        type: DataTypes.JSON,
        allowNull: false
    }
});

(async () => {
    await sequelize.sync();
})();

module.exports = StaffApplication;
