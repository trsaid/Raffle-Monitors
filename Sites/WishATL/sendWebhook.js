const Config = require('../../config/Config.json');
const Logger = require('../../tools/Logger');

const axios = require('axios');

const sendWebhook = async (data, site) => {
  try {
    const webhookFormat = {
      embeds: [
        {
          color: 5301186,
          fields: [
            { name: '**Title**', value: data.title, inline: true },
            { name: '**Store**', value: site, inline: true },
            { name: '**Locale**', value: data.locale, inline: true },
            { name: '**End Date**', value: data.endDate, inline: true },
            {
              name: '**URL**',
              value: data.url
            }
          ],
          author: {
            name: data.title,
            url: data.url,
            icon_url:
              'https://cdn.shopify.com/s/files/1/0961/8798/collections/wish_grande.jpg?v=1466529842'
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
      avatar_url:
        'https://cdn.shopify.com/s/files/1/0961/8798/collections/wish_grande.jpg?v=1466529842'
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

module.exports = sendWebhook;
