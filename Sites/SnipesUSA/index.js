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
    Logger.log('Monitoring SnipesUSA releases...');
    console.log();
    let releases = await getRafflePage(
      'https://raffle.snipesusa.com/api/v3/raffles'
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
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
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
};

main();
