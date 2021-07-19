const Logger = require('../../tools/Logger');
const Helper = require('../../tools/Helper');
const Config = require('../../config/Config.json');
const sendWebhook = require('./sendWebhook');
const logReleases = require('../../tools/LogReleases');

const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const clear = require('clear');

let activeReleases = [];
const site = 'Kith';

const main = async () => {
  clear();
  let firstRun = true;

  while (true) {
    Logger.log(`Monitoring ${site} releases...`);
    console.log();
    let releases = await getRafflePage('https://kith.com/pages/drawings-list');

    // check if scraped releases are in array
    for (const release of releases) {
      let releaseFound = activeReleases.some(
        (el) => el.title === release.title
      );
      if (!releaseFound) {
        Logger.log(`New release found - ${chalk.whiteBright(release.title)}`);
        activeReleases.push(release);
        if (!firstRun) {
          console.log();
          Logger.log(chalk.yellowBright('Sending Webhook...'));
          await sendWebhook(release, site);
        }
      }
    }
    logReleases(activeReleases);

    await Helper.sleep(Config.delay);
    firstRun = false;
  }
};

const getRafflePage = async (url) => {
  const options = {
    method: 'GET',
    url,
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
    }
  };

  try {
    const res = await axios(options);
    if (res.status === 200) return parseData(res.data);
  } catch (err) {
    Logger.error(err);
    return [];
  }
};

const parseData = (html) => {
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
};

main();
