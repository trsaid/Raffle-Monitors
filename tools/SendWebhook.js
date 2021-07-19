const Config = require('../config/Config.json');
const Logger = require('./Logger');

const axios = require('axios');

/**
 *
 * @param {string} site name of site
 * @param {object} data release data - data.title, data.url, and data.imgURL are all required
 * @param {string} iconURL site icon url
 * @param {array} fields array of embed fields
 */
const SendWebhook = async (site, data, iconURL, fields) => {
  site = site === 'LapstoneHammer' ? 'Lapstone & Hammer' : site;
  try {
    const webhookFormat = {
      embeds: [
        {
          color: 5301186,
          fields,
          author: {
            name: data.title,
            url: data.url,
            icon_url: iconURL
          },
          footer: {
            text: '@trippiereedd',
            icon_url:
              'https://cdn.discordapp.com/avatars/175804433790140417/f6c30aaa4270fab75b5bc0763f702048.webp?size=128'
          },
          timestamp: new Date().toISOString(),
          image: {
            url: data.imgURL
          }
        }
      ],
      username: `${site} Monitor`,
      avatar_url: iconURL
    };

    const options = {
      method: 'POST',
      url: Config.webhookURL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: webhookFormat
    };

    axios(options);
  } catch (err) {
    Logger.error(err);
    Logger.error('Failed to send webhook');
  }
};

module.exports = SendWebhook;
