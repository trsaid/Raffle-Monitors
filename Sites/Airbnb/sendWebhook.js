const Config = require('../../config/Config.json');
const Logger = require('../../tools/Logger');

const axios = require('axios');

const sendWebhook = async (data) => {
  try {
    const webhookFormat = {
      embeds: [
        {
          color: 16734815,
          fields: [
            { name: '**Title**', value: data.title, inline: true },
            {
              name: '**Details**',
              value: data.homeDetails.map((e) => e.title).join(' - '),
              inline: true
            },
            {
              name: '**Price (Per Night)**',
              value: `${data.pricePerNight} ${data.currency}`
            },
            {
              name: '**Price (Total)**',
              value: `${data.priceTotal} ${data.currency}`
            },
            {
              name: '**Average Rating**',
              value:
                data.averageRating === null
                  ? '-'
                  : data.averageRating.toString()
            },
            {
              name: '**URL**',
              value: data.url
            }
          ],
          author: {
            name: 'Airbnb Monitor - New Listing Detected!',
            url: data.url,
            icon_url:
              'https://assets.entrepreneur.com/content/3x2/2000/1405612741-airbnb-why-new-logo.jpg'
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
      username: 'Airbnb Monitor',
      avatar_url:
        'https://assets.entrepreneur.com/content/3x2/2000/1405612741-airbnb-why-new-logo.jpg'
    };

    let options = {
      method: 'POST',
      url: 'https://discord.com/api/webhooks/851719085262897152/-i2CIto0j_6gME1XvHt3pU4O4aIxBbfDcmiLoqWRsRB8qReYEyf69GsEBEyIaCNVhMZM',
      headers: {
        'Content-Type': 'application/json'
      },
      data: webhookFormat
    };

    await axios(options);
  } catch (err) {
    Logger.error(err);
    Logger.error('Failed to send webhook');
  }
};

module.exports = sendWebhook;
