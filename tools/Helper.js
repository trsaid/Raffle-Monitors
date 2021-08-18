const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class Helper {
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static randomArrElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomNumRange(min, max) {
    return Math.floor(min + Math.random() * max);
  }

  static getProxy(part = undefined, id = '') {
    if (!part) return process.env.PROXY;

    const proxyArr = process.env[`PROXY${id}`].split(':');
    const proxyObject = {
      host: proxyArr[0],
      port: proxyArr[1],
      auth: {
        username: proxyArr[2],
        password: proxyArr[3]
      }
    };

    switch (part) {
      case 'host':
        return proxyObject.host;

      case 'port':
        return proxyObject.port;

      case 'username':
        return proxyObject.auth.username;

      case 'password':
        return proxyObject.auth.password;

      default:
        return process.env.PROXY;
    }
  }
}

module.exports = Helper;
