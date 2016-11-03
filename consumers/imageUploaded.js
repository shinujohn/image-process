
let shortId = require('shortid');
let locator = global.locator;
class ImageUploadedConsumer {

    constructor() {
        this.topic = 'imageUploaded';
    }

    /**
     * Handles messages published in this consumers queue: When an image is uploaded, mark it for processing
     */
    handle(message, headers) {
        global.locator.logger.debug('handling imageUploaded');
        return global.locator.db.insert('imageProcessor_image', {
            id: shortId.generate(),
            imageId: message.id,
            filename: message.media.filename,
            procesed: false,
            processedOn: null,
            data: null
        });
    }
}

module.exports = new ImageUploadedConsumer();