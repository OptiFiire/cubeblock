const youtuberModel = require('../models/youtuberModel')
const channels = require('../json/channels.json');
const keys = require('../json/keys.json');
const { google } = require('googleapis');
const print = require('./print');
const axios = require('axios');

let apiKeyIndex = 0;
const apiKeys = keys.youtube;

function getNextApiKey() {
    const apiKey = apiKeys[apiKeyIndex];
    apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
    return apiKey;
}

function getYoutubeInstance() {
    return google.youtube({
        version: 'v3',
        auth: getNextApiKey(),
    });
}

async function linkWorks(link) {
    try {
        const inviteCode = link.replace('https://discord.gg/', '').replace('.', '');
        const inviteResponse = await axios.get(`https://discord.com/api/v10/invites/${inviteCode}`);
        return inviteResponse.data.guild.id === "1053689289592025098";
    } catch (error) {
        return false;
    }
}

function extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

async function checkUploads(client) {
    const youtubers = await youtuberModel.findAll()

    for (const youtuber of youtubers) {
        try {
            const youtube = getYoutubeInstance();
            const response = await youtube.search.list({
                part: 'snippet',
                channelId: youtuber.id,
                maxResults: 1,
                order: 'date',
            });

            if (!response.data.items.length) continue;

            const video = response.data.items[0];
            const videoId = video.id.videoId;
            const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

            if (youtuber.lastVideo === videoLink) return;

            const videoInfo = response.data.items[0].snippet;
            const videoDescription = videoInfo.description;

            const urls = extractUrls(videoDescription);
            let validLinkFound = false;

            for (const url of urls) {
                if (await linkWorks(url)) {
                    validLinkFound = true;
                    break;
                }
            }

            if (validLinkFound) {
                youtuber.lastVideo = videoLink;
                await youtuber.save()

                const contentChannel = await client.channels.cache.get(channels.content)
                
                contentChannel.send({
                    content: `Our YouTube partner **${videoInfo.channelTitle}** just uploaded a video! [Watch it now](${videoLink})!`,
                }).then(msg => {
                    msg.react(youtuber.reaction || "")
                })
            }
        } catch (err) {
            if (err.message === 'The request cannot be completed because you have exceeded your <a href="/youtube/v3/getting-started#quota">quota</a>.') return
            print.error(err)
        }
    }
}

module.exports = { checkUploads }