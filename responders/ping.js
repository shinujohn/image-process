var TranscriptService = require('../services/transcript.js');

class PingResponder {
    constructor() {
    }

    /**
     * Registeres the API handlers  
     */
    handle(app) {

        let _this = this;
        let logger = global.locator.logger;
        let db = global.locator.database;

        /**
         * Creates a new request for transcript
         */
        app.get('/ping', function (req, res, next) {

            var pingResponse = {
                timestamp: new Date(),
                api: 'success',
                db: null
            }

            logger.info('Responding to ping');
            db.ping().then(function () {

                pingResponse.db = 'success';
                res.send(pingResponse);
            }).catch(function (error) {

                logger.error(error);
                pingResponse.db = 'fail';
                res.send(pingResponse);
            });
        })
    }
}

module.exports = new PingResponder();