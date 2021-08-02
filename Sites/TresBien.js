const Logger = require('../tools/Logger');

const axios = require('axios');
const cheerio = require('cheerio');

class TresBien {
  constructor() {
    this.site = 'TresBien';
    this.raffleMonitorURL = 'https://tres-bien.com/sneakers';
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
      throw `Unexpected response from ${this.site} monitor endpoint`;
    } catch (err) {
      Logger.error(err);
      return [];
    }
  }

  parseData(html) {
    const $ = cheerio.load(html);
    return $('ul.product-items')
      .children()
      .map((i, elem) => {
        const $$ = cheerio.load($(elem).html());
        let info = $$('.product-item-extra-info').text().trim();

        if (info === 'Raffle') {
          return {
            title: $$('.product-item-link').text(),
            url: $$('.product-item-link').attr('href'),
            price: $$('.price').text(),
            imgURL: $$('.product-item-photo-wrapper img').attr('src')
          };
        }
      })
      .toArray();
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      { name: '**Price**', value: data.price },
      {
        name: '**URL**',
        value: data.url
      }
    ];
  }
}

module.exports = { TresBien };
