var TranscriptService = require('../services/transcript.js');

class TranscriptRequestResponder {
    constructor() {
    }

    /**
     * Registeres the API handlers for transcript requests
     */
    handle(app) {

        let _this = this;
        let logger = global.locator.logger;

        /**
         * Creates a new request for transcript
         */
        app.post('/api/v1/transcriptRequests', function (req, res, next) {

            var transcriptService = new TranscriptService(global.locator, req.clientContext);
            transcriptService.createRequest(req.body).then(function (transcriptRequest) {

                res.send(transcriptRequest);
            });
        })
    }
}

module.exports = new TranscriptRequestResponder();