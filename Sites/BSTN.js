const Logger = require('../tools/Logger');
const Helper = require('../tools/Helper');

const axios = require('axios-https-proxy-fix');

class BSTN {
  constructor() {
    this.site = 'BSTN';
    this.proxy = true;
    this.raffleMonitorURL = 'https://api-v2.soleretriever.com/graphql';
    this.siteIcon = 'https://www.fashionsauce.com/img/stores/bstn-store.png';
  }

  getIcon() {
    return this.siteIcon;
  }

  async getRafflePage() {
    const options = {
      method: 'POST',
      url: this.raffleMonitorURL,
      headers: {
        'content-type': 'application/json',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
      },
      data: {
        query:
          'query RafflesFromRetailer($retailerId: Int!, $from: Int, $limit: Int, $filters: RaffleFilters) {    rafflesFromRetailer(retailerId: $retailerId, from: $from, limit: $limit, filters: $filters) {      count      locales      raffles {        id        url        type        isPickup        hasPostage        locale        startDate        endDate        product {          brand          id          name          slug          cloudFrontImageUrl        }      }    }  }',
        variables: {
          filters: {
            locales: [],
            types: [],
            isHideEntered: true
          },
          retailerId: 148, // BSTN Id
          limit: 10,
          from: 0
        }
      },
      proxy: {
        protocol: 'http',
        host: Helper.getProxy('host'),
        port: Helper.getProxy('port'),
        auth: {
          username: Helper.getProxy('username'),
          password: Helper.getProxy('password')
        }
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

  parseData(data) {
    let { rafflesFromRetailer } = data.data;
    rafflesFromRetailer = rafflesFromRetailer.raffles.filter(
      (el) => el.endDate !== null && el.type === 'ONLINE'
    );
    return rafflesFromRetailer.map((el) => {
      return {
        title: el.product.name,
        url: el.url,
        endDate: `${new Date(el.endDate).toDateString()}, ${new Date(
          el.endDate
        ).toLocaleTimeString()}`,
        locale: el.locale,
        imgURL: el.product.cloudFrontImageUrl
      };
    });
  }

  getWebhookFields(data) {
    return [
      { name: '**Title**', value: data.title, inline: true },
      { name: '**Store**', value: this.site, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }, // spacing field
      { name: '**End Date**', value: data.endDate, inline: true },
      { name: '**Locale**', value: data.locale, inline: true },
      {
        name: '**URL**',
        value: data.url
      }
    ];
  }
}

module.exports = { BSTN };
