let locator = global.locator;
let MediaService = require('./../services/mediaService');

class processorResponder {

    constructor() {
    }

    /**
     * Registeres the API handlers
     */
    handle(app) {

        let _this = this;
        let logger = global.locator.logger;
        let mediaService = new MediaService(global.locator);

        
    }
}

module.exports = new processorResponder();