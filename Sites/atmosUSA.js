const Logger = require('../tools/Logger');

const axios = require('axios');

class atmosUSA {
  constructor() {
    this.site = 'atmosUSA';
    this.raffleMonitorURL =
      'https://stage-ubiq-raffle-strapi-be.herokuapp.com/releases/active';
    this.siteIcon =
      'https://cdn.shopify.com/s/files/1/0011/8574/2900/files/AtmosUSA-NewYork_800x.jpg?v=1604712584';
  }

  getIcon() {
    return this.siteIcon;
  }

  async getRafflePage() {
    const options = {
      method: 'GET',
      url: this.raffleMonitorURL,
      headers: {
        Origin: 'https://releases.atmosusa.com',
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

  parseData(data) {
    let arr = [];

    data.forEach((el) => {
      arr.push({
        title: el.name,
        url: 'https://releases.atmosusa.com/releases',
        price: `USD $${el.price}.00`,
        releaseType: el.style,
        releaseDate: `${new Date(
          el.registrationStartDate
        ).toDateString()}, ${new Date(
          el.registrationStartDate
        ).toLocaleTimeString()}`,
        imgURL: el.images[0].url
      });
    });

    return arr;
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      { name: '**Release Type**', value: data.releaseType },
      { name: '**Release Date**', value: data.releaseDate },
      {
        name: '**Price**',
        value: data.price
      },
      {
        name: '**URL**',
        value: data.url
      }
    ];
  }
}

module.exports = { atmosUSA };
