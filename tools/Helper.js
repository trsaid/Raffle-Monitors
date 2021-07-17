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
}

module.exports = Helper;
