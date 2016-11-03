
let nconf = require('nconf');
let Factory = require('./../providers/factory');

class Logger {

    constructor(name) {
        global.locator = global.locator || {};
    }

    /**
     * Initialise the setup : connects to the mongdb
     */
    init() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            global.locator.logger = Factory.getLogger(nconf.get('logger:type'));
            resolve();
        });
    }

}

module.exports = new Logger();