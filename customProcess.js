const Logger = require('./tools/Logger');
const Helper = require('./tools/Helper');
const Config = require('./config/Config.json');
const SendWebhook = require('./tools/SendWebhook');

const chalk = require('chalk');
const clear = require('clear');

const validSites = [
  'Airbnb',
  'atmosUSA',
  'BSTN',
  'Commonwealth',
  'Custom',
  'DSMNY',
  'Kith',
  'LapstoneHammer',
  'Naked',
  'SnipesUSA',
  'TresBien',
  'WishATL'
];

const {
  Airbnb,
  atmosUSA,
  BSTN,
  Commonwealth,
  Custom,
  DSMNY,
  Kith,
  LapstoneHammer,
  Naked,
  SnipesUSA,
  TresBien,
  WishATL
} = require('./Sites/index');

const constructors = {
  Airbnb,
  atmosUSA,
  BSTN,
  Commonwealth,
  Custom,
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

  const site = checkArguments();
  const siteObj = new constructors[site]();
  checkProxy(siteObj);

  while (true) {
    Logger.log(`Monitoring ${site} releases...`);
    console.log();
    const release = await siteObj.getRafflePage();
    console.log(release);
    console.log();

    if (!release) {
      await Helper.sleep(siteObj.proxy ? Config.proxyDelay : Config.delay);
      continue;
    }

    if (release.ticketStatus !== 'Allocation Exhausted') {
      Logger.log(chalk.yellowBright('Sending Webhook...'));
      console.log();
      SendWebhook(
        site,
        release,
        siteObj.getIcon(),
        siteObj.getWebhookFields(release)
      );
    }

    await Helper.sleep(siteObj.proxy ? Config.proxyDelay : Config.delay);
  }
};

const checkArguments = () => {
  // const site = process.argv[2];
  const site = 'Custom';

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

const checkProxy = (siteObj) => {
  if (!siteObj.proxy) return; // return if no proxy required

  const proxy = Helper.getProxy();

  if (!proxy) {
    Logger.error(
      `Please provide a proxy in the .env file before running ${siteObj.site} monitor`
    );
    process.exit();
  }

  return;
};

main();
