const therapyModel = require('../models/therapyModel');
const print = require('./print');

async function checkEndedSessions() {
    try {
        const therapies = await therapyModel.findAll();

        for (const therapy of therapies) {
            if (new Date(therapy.endTime) < Date.now()) {
                await therapy.destroy({
                    where: {
                        user: {
                            id: therapy.user.id
                        }
                    }
                });
            }
        }
    } catch (error) {
        print.error(error);
    }
}

module.exports = { checkEndedSessions };