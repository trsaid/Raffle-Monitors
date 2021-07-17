const Config = require("../../config/Config.json");
const Logger = require("../../tools/Logger");

const axios = require("axios");

const sendWebhook = async (data) => {
  try {
    const webhookFormat = {
      embeds: [
        {
          color: 5301186,
          fields: [
            { name: "**Title**", value: data.title, inline: true },
            { name: "**Store**", value: "Très Bien", inline: true },
            { name: "**Price**", value: data.price },
            {
              name: "**URL**",
              value: data.url
            }
          ],
          author: {
            name: data.title,
            url: data.url,
            icon_url:
              "https://pbs.twimg.com/profile_images/1092805599165906946/uCD71Kyg.jpg"
          },
          footer: {
            text: "@trippiereedd",
            icon_url:
              "https://cdn.discordapp.com/avatars/175804433790140417/f6c30aaa4270fab75b5bc0763f702048.webp?size=128"
          },
          timestamp: new Date().toISOString(),
          image: {
            url: data.imgURL
          }
        }
      ],
      username: "Très Bien Monitor",
      avatar_url:
        "https://pbs.twimg.com/profile_images/1092805599165906946/uCD71Kyg.jpg"
    };

    let options = {
      method: "POST",
      url: Config.webhookURL,
      headers: {
        "Content-Type": "application/json"
      },
      data: webhookFormat
    };

    axios(options);
  } catch (err) {
    Logger.error(err);
    Logger.error("Failed to send webhook");
  }
};

module.exports = sendWebhook;
