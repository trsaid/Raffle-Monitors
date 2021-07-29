const Logger = require('./tools/Logger');
const Helper = require('./tools/Helper');
const Config = require('./config/Config.json');
const SendWebhook = require('./tools/SendWebhook');
const LogReleases = require('./tools/LogReleases');

const chalk = require('chalk');
const clear = require('clear');

const validSites = [
  'atmosUSA',
  'BSTN',
  'Commonwealth',
  'DSMNY',
  'Kith',
  'LapstoneHammer',
  'Naked',
  'SnipesUSA',
  'TresBien',
  'WishATL'
];

const {
  atmosUSA,
  BSTN,
  Commonwealth,
  DSMNY,
  Kith,
  LapstoneHammer,
  Naked,
  SnipesUSA,
  TresBien,
  WishATL
} = require('./Sites/index');

const constructors = {
  atmosUSA,
  BSTN,
  Commonwealth,
  DSMNY,
  Kith,
  LapstoneHammer,
  Naked,
  SnipesUSA,
  TresBien,
  WishATL
};

const main = async () => {
  clear();

  let activeReleases = [];
  const site = checkArguments();
  const siteObj = new constructors[site]();

  let firstRun = true;
  while (true) {
    Logger.log(`Monitoring ${site} releases...`);
    console.log();
    const releases = await siteObj.getRafflePage();

    // check if scraped releases are in array
    for (const release of releases) {
      const releaseFound = activeReleases.some(
        (el) => el.title === release.title
      );
      if (!releaseFound) {
        Logger.log(`New release found - ${chalk.whiteBright(release.title)}`);
        activeReleases.push(release);
        if (!firstRun) {
          Logger.log(chalk.yellowBright('Sending Webhook...'));
          console.log();
          SendWebhook(
            site,
            release,
            siteObj.getIcon(),
            siteObj.getWebhookFields(release)
          );
        }
      }
    }
    LogReleases(activeReleases);

    await Helper.sleep(siteObj.proxy ? Config.proxyDelay : Config.delay);
    firstRun = false;
  }
};

const checkArguments = () => {
  const site = process.argv[2];
  // const site = 'DSMNY';

  if (!site) {
    Logger.error('Please provide a valid site as args');
    process.exit();
  }

  const validSite = validSites.some(
    (el) => site.toLowerCase() === el.toLowerCase()
  );

  if (!validSite) {
    Logger.error(
      `${site} is not considered a valid site, please check the README for valid inputs`
    );
    process.exit();
  }

  return site;
};

main();
