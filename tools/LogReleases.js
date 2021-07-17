const chalk = require('chalk');

const logReleases = (releases) => {
  if (releases.length > 0) {
    console.log(
      `${chalk.yellowBright('-------------')} ${chalk.greenBright(
        'Monitored Releases'
      )} ${chalk.yellowBright('-------------')}`
    );
    releases.forEach((el) =>
      console.log(
        `${chalk.yellowBright('Title:')} ${chalk.greenBright(el.title)}`
      )
    );
    console.log();
  }
};

module.exports = logReleases;
