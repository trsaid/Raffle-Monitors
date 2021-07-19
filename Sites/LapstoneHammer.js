const Logger = require('../tools/Logger');

const axios = require('axios');
const cheerio = require('cheerio');

class LapstoneHammer {
  constructor() {
    this.site = 'LapstoneHammer';
    this.raffleMonitorURL =
      'https://www.lapstoneandhammer.com/collections/releases';
    this.siteIcon =
      'https://pbs.twimg.com/profile_images/1214625059656097796/jjTKxXdR.jpg';
  }

  getIcon() {
    return this.siteIcon;
  }

  async getRafflePage() {
    const options = {
      method: 'GET',
      url: this.raffleMonitorURL,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
      }
    };

    try {
      const res = await axios(options);
      if (res.status === 200) return this.parseData(res.data);
    } catch (err) {
      Logger.error(err);
      return [];
    }
  }

  parseData(html) {
    const $ = cheerio.load(html);

    return $('.product-item')
      .map((i, elem) => {
        const $$ = cheerio.load($(elem).html());

        return {
          title: $$('.title').text().trim(),
          url: `https://www.lapstoneandhammer.com${$$('.title > a').attr(
            'href'
          )}`,
          releaseDate: $$('.vendor').text(),
          price: $$('.price').text().trim(),
          imgURL: `https:${$$('img').attr('src')}`
        };
      })
      .toArray();
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: 'Lapstone & Hammer', inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacing field
      { name: '**Release Date**', value: data.releaseDate, inline: true },
      {
        name: '**Price**',
        value: data.price,
        inline: true
      },
      {
        name: '**URL**',
        value: data.url
      }
    ];
  }
}

module.exports = { LapstoneHammer };
