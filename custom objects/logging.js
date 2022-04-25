const colors = require('colors');
module.exports = {
  name: "logging",
  description: "basic logging object that will change which logs are displayed according to a level",
  logging: {
    level: 3,
    info: function(text) {
      if (this.level >= 3) {
        console.log('INFO'.bgGreen.black + ' ' + text);
      }
    },
    warn: function(text) {
      if (this.level >= 2) {
        console.log('WARN'.bgYellow.black + ' ' + text);
      }
    },
    error: function(text) {
      if (this.level >= 1) {
        console.log('ERROR'.bgRed.black + ' ' + text);
      }
    },
    debug: function(text) {
      if (this.level >= 4) {
        console.log('DEBUG'.bgBlue + ' ' + text);
      }
    }
  }

}
