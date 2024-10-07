const axios = require('axios');
require("dotenv").config();

class User {
    constructor(id) {
        this.id = id;
        this.baseUrl = `https://discord.com/api/v9/users/${this.id}/profile`;
        this.headers = { Authorization: process.env.OATC };
    }

    async getData() { return (await axios.get(this.baseUrl, { headers: this.headers })).data }

    async getBadges() { return (await this.getData()).badges }

    async getConnections() { return (await this.getData()).connected_accounts; }

    async getProfile() {
        return {
            "user": (await this.getData()).user,
            "user_profile": (await this.getData()).user_profile
        }
    }
}

module.exports = User;