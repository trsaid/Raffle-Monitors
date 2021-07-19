const Logger = require('../tools/Logger');

const axios = require('axios');

class SnipesUSA {
  constructor() {
    this.site = 'SnipesUSA';
    this.raffleMonitorURL = 'https://raffle.snipesusa.com/api/v3/raffles';
    this.siteIcon =
      'https://mediaservice.retailmenot.com/ws/mediagroup/7L3JMO4T2JDNTLNYD5GSZFXH5I?width=255&height=255';
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

  parseData(data) {
    return data.data.map((el) => {
      return {
        title: el.name,
        url: 'https://raffle.snipesusa.com/raffles',
        startDate: `${new Date(
          el.registration_start_date
        ).toDateString()}, ${new Date(
          el.registration_start_date
        ).toLocaleTimeString()}`,
        endDate: `${new Date(
          el.registration_end_date
        ).toDateString()}, ${new Date(
          el.registration_end_date
        ).toLocaleTimeString()}`,
        imgURL: el.image
      };
    });
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      { name: '**Start Date**', value: data.startDate },
      { name: '**End Date**', value: data.endDate },
      {
        name: '**URL**',
        value: data.url
      }
    ];
  }
}

module.exports = { SnipesUSA };
