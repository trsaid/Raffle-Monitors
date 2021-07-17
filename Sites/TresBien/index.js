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

const main = async () => {
  clear();
  let firstRun = true;

  while (true) {
    Logger.log('Monitoring Très Bien releases...');
    console.log();
    let releases = await getRafflePage('https://tres-bien.com/sneakers');
    // check if scraped releases are in array
    for (const release of releases) {
      let releaseFound = activeReleases.some(
        (el) => el.title === release.title
      );
      if (!releaseFound) {
        Logger.log(`New release found - ${chalk.whiteBright(release.title)}`);
        Logger.log(chalk.yellowBright('Sending Webhook...'));
        console.log();
        activeReleases.push(release);
        if (!firstRun) await sendWebhook(release);
      }
    }
    logReleases(activeReleases);

    await Helper.sleep(Config.delay);
    firstRun = false;
  }
};

const getRafflePage = async (url) => {
  let options = {
    method: 'GET',
    url
  };

  try {
    let res = await axios(options);
    if (res.status === 200) return parseHTML(res.data);
  } catch (err) {
    Logger.error(err);
    return [];
  }
};

const parseHTML = (html) => {
  let arr = [];
  const $ = cheerio.load(html);
  $('ul.product-items')
    .children()
    .each((i, elem) => {
      const $$ = cheerio.load($(elem).html());
      let info = $$('.product-item-extra-info').text().trim();

      if (info === 'Raffle') {
        arr.push({
          title: $$('.product-item-link').text(),
          url: $$('.product-item-link').attr('href'),
          price: $$('.price').text(),
          imgURL: $$('.product-item-photo-wrapper img').attr('src')
        });
      }
    });
  return arr;
};

main();
