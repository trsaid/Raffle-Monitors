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

  while (true) {
    Logger.log('Monitoring Lapstone & Hammer releases...');
    console.log();
    let releases = await getRafflePage(
      'https://www.lapstoneandhammer.com/collections/releases'
    );
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
        await sendWebhook(release);
      }
    }
    logReleases(activeReleases);

    await Helper.sleep(Config.delay);
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
  }
};

const parseHTML = (html) => {
  let arr = [];
  const $ = cheerio.load(html);

  $('.product-item').each((i, elem) => {
    const $$ = cheerio.load($(elem).html());

    arr.push({
      title: $$('.title').text().trim(),
      url: `https://www.lapstoneandhammer.com${$$('.title > a').attr('href')}`,
      releaseDate: $$('.vendor').text(),
      price: $$('.price').text().trim(),
      imgURL: `https:${$$('img').attr('src')}`
    });
  });

  return arr;
};

main();
