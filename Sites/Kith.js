const Logger = require('../tools/Logger');

const axios = require('axios');
const cheerio = require('cheerio');

class Kith {
  constructor() {
    this.site = 'Kith';
    this.raffleMonitorURL = 'https://kith.com/pages/drawings-list';
    this.siteIcon =
      'https://pbs.twimg.com/profile_images/1325437369798025216/6dgZGVMw.jpg';
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

    return $('ul.page-drawings__drawings')
      .children()
      .map((_, el) => {
        const $$ = cheerio.load($(el).html());

        return {
          title: $$('.drawings__title').text(),
          url: $$('.drawings__link').attr('href'),
          imgURL: $$('img').attr('src').replace('//', 'https://')
        };
      })
      .toArray();
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      {
        name: '**URL**',
        value: data.url
      }
    ];
  }
}

module.exports = { Kith };
