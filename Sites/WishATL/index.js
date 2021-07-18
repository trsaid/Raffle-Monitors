const Logger = require('../../tools/Logger');
const Helper = require('../../tools/Helper');
const Config = require('../../config/Config.json');
const sendWebhook = require('./sendWebhook');
const logReleases = require('../../tools/LogReleases');

const axios = require('axios');
const chalk = require('chalk');
const clear = require('clear');

let activeReleases = [];
const site = 'WishATL';

const main = async () => {
  clear();
  let firstRun = true;

  while (true) {
    Logger.log(`Monitoring ${site} releases...`);
    console.log();
    let releases = await getRafflePage(
      'https://api-v2.soleretriever.com/graphql'
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
        if (!firstRun) await sendWebhook(release, site);
      }
    }
    logReleases(activeReleases);

    await Helper.sleep(Config.delay);
    firstRun = false;
  }
};

const getRafflePage = async (url) => {
  const options = {
    method: 'POST',
    url,
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
        retailerId: 12, // WishATL Id
        limit: 10,
        from: 0
      }
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

const parseData = (data) => {
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
};

main();
