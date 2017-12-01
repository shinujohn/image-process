let fs = require('fs');
let Busboy = require('busboy');
let shortId = require('shortid');
let Factory = require('./../providers/factory');
let nconf = require('nconf');
let MediaService = require('./../services/mediaService');

let locator = global.locator;

/**
 * Handles APIs related to media store
 */
class MediaResponder {

    constructor() {
    }

    /**
     * Registeres the APIs
     */
    handle(app) {

        let _this = this;
        let logger = global.locator.logger;
        let mediaService = new MediaService(global.locator);

        /**
         * To upload the file (media), saves the file from request to configured storage, and details to database
         */
        app.post('/api/transcripts/requests/:id/media', function (req, res, next) {


            // Collecting data from request
            var data = {
                id: shortId.generate()
            };
            var busboy = new Busboy({ headers: req.headers });

            // File
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

                // Get the file details
                file.on('end', function () {
                    data['media'] = {
                        filename: filename,
                        encoding: encoding,
                        mimetype: mimetype
                    }
                    logger.debug('File [' + fieldname + '] Finished');
                });

                // Save to the storage
                file.pipe(Factory.getStorageProvider(nconf.get('config:storage:type')).getWritableStream(data.id, function () { }));
            });

            // Other form data
            busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                data[fieldname] = val;
            });

            // All done
            busboy.on('finish', function () {

                // Now save the metadata to the local database
                mediaService.save(data).then(function () {
                    res.sendStatus(200);
                });
            });

            req.pipe(busboy);
        });

        /**
         * To download the media with given request ID, gets the details from database and reads the file from the storage
         */
        app.get('/api/transcripts/requests/:id/media', function (req, res, next) {

            // Get the media properties from local db
            mediaService.get(req.params.id).then(function (result) {

                // Read file from storage and write to response
                res.setHeader('Content-disposition', 'attachment; filename=' + result.media.filename);
                res.setHeader('Content-type', result.media.mimetype);
                Factory.getStorageProvider(nconf.get('config:storage:type')).getReadableStream(result.id, res, function (error, result, response) { });
            });
        })
    }
}

module.exports = new MediaResponder();