const Logger = require('../../tools/Logger');
const Helper = require('../../tools/Helper');
const Config = require('../../config/Config.json');
const sendWebhook = require('./sendWebhook');
const logReleases = require('../../tools/LogReleases');

const axios = require('axios-https-proxy-fix');
const cheerio = require('cheerio');
const chalk = require('chalk');
const clear = require('clear');

let activeReleases = [];

const main = async () => {
  clear();

  while (true) {
    Logger.log('Monitoring Airbnb query...');
    console.log();
    let releases = await getQuery(
      'https://www.airbnb.co.nz/s/Gisborne/homes?query=Gisborne&checkin=2021-12-28&checkout=2022-01-01&adults=4'
    );
    // check if scraped releases are in array
    for (let x = 0; x < releases.length; x++) {
      let releaseFound = activeReleases.some((el) => el.id === releases[x].id);
      if (!releaseFound) {
        Logger.log(
          `New release found - ${chalk.whiteBright(releases[x].title)}`
        );
        Logger.log(chalk.yellowBright('Sending Webhook...'));
        console.log();
        activeReleases.push(releases[x]);
        await sendWebhook(releases[x]);
      }
    }
    logReleases(activeReleases);

    await Helper.sleep(Config.delay);
  }
};

const getQuery = async (url) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      proxy: {
        protocol: 'http',
        host: 'nzl.resi.runproxies.co',
        port: 7932,
        auth: {
          username: '8XlAT69D',
          password:
            '1kINbDcpeLPZxddIOFG6wc6EUNe2YM4BvDN07aAuf2Z5JoDBqJFk0pOlQE7pMJybDQdcd-WGfGDSaN'
        }
      },
      timeout: 30000
    });
    if (res.status === 200) return parseData(res.data);
  } catch (err) {
    Logger.error(err);
    return [];
  }
};

const parseData = (data) => {
  try {
    const $ = cheerio.load(data);
    const jsonData = JSON.parse($('#data-state').html());
    const listings =
      jsonData['niobeMinimalClientData'][1][1]['data']['dora']['exploreV3'][
        'sections'
      ][1]['items'];

    return listings.map((el) => {
      const { listing, pricingQuote: pricing } = el;

      return {
        id: listing['id'],
        title: listing['name'],
        url: `https://www.airbnb.co.nz/rooms/${listing['id']}`,
        averageRating: listing['avgRating'],
        personCapacity: listing['personCapacity'],
        homeDetails: listing['homeDetails'],
        imgURL: listing['contextualPictures'][0]['picture'],
        pricePerNight: pricing['priceString'],
        priceTotal: pricing['price']['total']['amountFormatted'],
        currency: pricing['price']['total']['currency'],
        pageTitle: {
          title:
            jsonData['niobeMinimalClientData'][1][1]['data']['dora'][
              'exploreV3'
            ]['pageTitle']['title'],
          kicker:
            jsonData['niobeMinimalClientData'][1][1]['data']['dora'][
              'exploreV3'
            ]['pageTitle']['kicker']
        }
      };
    });
  } catch (err) {
    return [];
  }
};

main();
