const Logger = require('../tools/Logger');

const axios = require('axios');
const cheerio = require('cheerio');

class Custom {
  constructor() {
    this.site = 'Custom';
    this.raffleMonitorURL =
      'https://www.moshtix.co.nz/v2/event/rhythm-and-vines-2021/123507';
    this.siteIcon =
      'https://play-lh.googleusercontent.com/lAbcH27TJrXQh8hhHra-R1JjqKG7hLfJUj3JjCESxMgwUGNmq9n3gZD6U9lZNu84Nb1Z';
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
      return undefined;
    }
  }

  parseData(html) {
    const $ = cheerio.load(html);

    const ticketInfo = $('li.event-ticket-type')
      .map((i, el) => {
        const $$ = cheerio.load($(el).html());
        const title = $$('.ticket-type-name').text();

        if (title !== '3 Day GA Festival Pass') return;

        return {
          title,
          closeDate: $$('.ticket-type-dates').text(),
          price: $$('.col-totalprice.ticket-type-total > span').first().text(),
          ticketStatus: $$('.ticket-type-quantity.col-quantity').text().trim()
        };
      })
      .toArray();

    if (!ticketInfo) return;

    return ticketInfo[0];
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacing field
      { name: '**Price**', value: data.price, inline: true },
      { name: '**End Date**', value: data.closeDate, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacing field
      { name: '**Ticket Status**', value: data.ticketStatus, inline: true },
      { name: '**URL**', value: this.raffleMonitorURL, inline: true }
    ];
  }
}

module.exports = { Custom };
