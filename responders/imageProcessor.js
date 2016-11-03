let locator = global.locator;
class imageProcessorResponder {

    constructor() {
    }

    /**
     * Registeres the API handlers
     */
    handle(app) {

        let _this = this;
        let logger = global.locator.logger;

        /**
         * Gets all unprocessed images
         */
        app.get('/unprocessedImages', function (req, res, next) {

            global.locator.db.find('imageProcessor_image', { processed: false }).then(function (result) {
                res.send(result);
            });
        })

        /**
         * Saves data against unprocessed image
         */
        app.put('/unprocessedImages/:id/data', function (req, res, next) {

            global.locator.db.update('imageProcessor_image', { filename: req.params.id }, {
                procesed: true,
                processedOn: new Date(),
                data: req.body
            }).then(function () {
                global.locator.queue.publish('imageProcessed', req.body);
                res.sendStatus(200);
            });
        });

        /**
         * gets the data saved against a processed image
         */
        app.get('/images/:id/data', function (req, res, next) {
            global.locator.db.findOne('imageText', { filename: req.params.id }).then(function (result) {
                res.send(result);
            });
        });
    }
}

module.exports = new imageProcessorResponder();