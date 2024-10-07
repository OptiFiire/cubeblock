const StaffApplicationModule = require('../utils/staffApplicationModule');
const { Events } = require('discord.js')

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const staffApplicationModule = new StaffApplicationModule(interaction)

        if (interaction.isModalSubmit()) {
            if (interaction.customId === "applyForStaffModal") return staffApplicationModule.sendConfirmSubmissionMessage()
        }

        if (interaction.isButton()) {
            if (interaction.customId === "applyForStaffButton") return staffApplicationModule.openModal();
            if (interaction.customId === "confirmSubmittingStaffAppButton") return staffApplicationModule.confirmSubmission();
            if (interaction.customId === "cancelSubmittingStaffAppButton") return staffApplicationModule.cancelSubmission();

            if (interaction.customId === "acceptStaffAppButton") return staffApplicationModule.accept();
            if (interaction.customId === "confirmStaffAppAcceptanceButton") return staffApplicationModule.confirmAcceptance();
            if (interaction.customId === "cancelStaffAppAcceptanceButton") return staffApplicationModule.cancelAcceptance();
            if (interaction.customId === "declineStaffAppButton") return staffApplicationModule.decline();
            if (interaction.customId === "confirmDeclineStaffAppButton") return staffApplicationModule.confirmDecline();
            if (interaction.customId === "cancelDeclineStaffAppButton") return staffApplicationModule.cancelDecline();
        };
    }
}