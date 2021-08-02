const Logger = require('../tools/Logger');

const axios = require('axios');
const cheerio = require('cheerio');

class DSMNY {
  constructor() {
    this.site = 'DSMNY';
    this.raffleMonitorURL =
      'https://shop-us.doverstreetmarket.com/collections/raffle';
    this.siteIcon =
      'https://newyork.doverstreetmarket.com/bundles/dsmfrontend/images/meta/newyork/doverstreetmarket.png';
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

    return $('li.product_card')
      .map((_, el) => {
        const $$ = cheerio.load($(el).html());

        if ($$('#countdown').text() !== 'Draw closed')
          return {
            title: $$('.product-card__title').text(),
            url: `https://shop-us.doverstreetmarket.com/${$$('a').attr(
              'href'
            )}`,
            imgURL: $$('img')
              .attr('src')
              .replace('//', 'https://')
              .split(' ')[0],
            price: $$('.product-card__pricing').text(),
            endDate: $$('#countdown').text()
          };
      })
      .toArray();
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacing field
      { name: '**Price**', value: data.price, inline: true },
      { name: '**End Date**', value: data.endDate, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacing field
      { name: '**URL**', value: data.url, inline: true }
    ];
  }
}

module.exports = { DSMNY };
