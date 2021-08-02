const Logger = require('../tools/Logger');

const axios = require('axios');
const cheerio = require('cheerio');

class Commonwealth {
  constructor() {
    this.site = 'Commonwealth';
    this.raffleMonitorURL = 'https://commonwealth-ftgg.ph/blogs/news';
    this.siteIcon =
      'https://pbs.twimg.com/profile_images/1172057210173526016/ZqF2Ubob.jpg';
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
    return $('#blog_post')
      .children()
      .map((i, elem) => {
        const $$ = cheerio.load($(elem).html());
        let title = $$('.article__title').text().trim();

        if (title.includes('Release Mechanics')) {
          return {
            title: title.replace('| Release Mechanics', '').trim(),
            url: `https://commonwealth-ftgg.ph${$$('.article__title > a').attr(
              'href'
            )}`,
            imgURL: `https:${$$('.image-element__wrap > img')
              .attr('src')
              .split('?v=')[0]
              .replace('_50x', '')}`
          };
        }
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

module.exports = { Commonwealth };
