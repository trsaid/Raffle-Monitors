const Config = require('../../config/Config.json');
const Logger = require('../../Tools/Logger');

const axios = require('axios');

const sendWebhook = async (data) => {
  try {
    const webhookFormat = {
      embeds: [
        {
          color: 5301186,
          fields: [
            { name: '**Title**', value: data.title, inline: true },
            { name: '**Store**', value: 'SnipesUSA', inline: true },
            { name: '**Start Date**', value: data.startDate },
            { name: '**End Date**', value: data.endDate },
            {
              name: '**URL**',
              value: data.url
            }
          ],
          author: {
            name: data.title,
            url: data.url,
            icon_url:
              'https://mediaservice.retailmenot.com/ws/mediagroup/7L3JMO4T2JDNTLNYD5GSZFXH5I?width=255&height=255'
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
      username: 'SnipesUSA Monitor',
      avatar_url:
        'https://mediaservice.retailmenot.com/ws/mediagroup/7L3JMO4T2JDNTLNYD5GSZFXH5I?width=255&height=255'
    };

    let options = {
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
