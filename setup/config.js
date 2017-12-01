
let nconf = require('nconf');
let Factory = require('./../providers/factory');

class Config {

    constructor(name) {
        global.locator = global.locator || {};
    }

    /**
     * Initialise the setup 
     */
    init() {
        return new Promise(function (resolve, reject) {
            global.locator.config = nconf.get('config');
            resolve();
        });
    }

}

module.exports = new Config();