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
            { name: "**Store**", value: "atmosUSA", inline: true },
            { name: "**Release Type**", value: data.releaseType },
            { name: "**Release Date**", value: data.releaseDate },
            {
              name: "**Price**",
              value: data.price
            },
            {
              name: "**URL**",
              value: data.url
            }
          ],
          author: {
            name: data.title,
            url: data.url,
            icon_url:
              "https://cdn.shopify.com/s/files/1/0011/8574/2900/files/AtmosUSA-NewYork_800x.jpg?v=1604712584"
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
      username: "atmosUSA Monitor",
      avatar_url:
        "https://cdn.shopify.com/s/files/1/0011/8574/2900/files/AtmosUSA-NewYork_800x.jpg?v=1604712584"
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
