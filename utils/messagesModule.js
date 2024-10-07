const axios = require('axios');
require("dotenv").config();

class Messages {
    async user(user, guild) {
        const messagesData = await axios({
            method: 'GET',
            url: `https://discord.com/api/v9/guilds/${guild}/messages/search?author_id=${user}`,
            headers: { Authorization: process.env.OATC }
        })

        return messagesData.data;
    }

    async server(guild, after) {
        const messagesData = await axios({
            method: 'GET',
            url: `https://discord.com/api/v9/guilds/${guild}/messages/search?min_id=${after}`,
            headers: { Authorization: process.env.OATC }
        })

        return messagesData.data;
    }
}

module.exports = new Messages();