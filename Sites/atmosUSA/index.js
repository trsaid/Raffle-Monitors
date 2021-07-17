const Logger = require('../../tools/Logger');
const Helper = require('../../tools/Helper');
const Config = require('../../config/Config.json');
const sendWebhook = require('./sendWebhook');
const logReleases = require('../../tools/LogReleases');

const axios = require('axios');
const chalk = require('chalk');
const clear = require('clear');

let activeReleases = [];

const main = async () => {
  clear();
  let firstRun = true;

  while (true) {
    Logger.log('Monitoring atmosUSA releases...');
    console.log();
    let releases = await getRafflePage(
      'https://stage-ubiq-raffle-strapi-be.herokuapp.com/releases/active'
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
    url,
    headers: {
      Origin: 'https://releases.atmosusa.com'
    }
  };

  try {
    let res = await axios(options);
    if (res.status === 200) return parseData(res.data);
  } catch (err) {
    Logger.error(err);
    return [];
  }
};

const parseData = (data) => {
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
};

main();
