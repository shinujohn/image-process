let shortId = require('shortid');

/**
 * Methods to handle the media operations
 */
module.exports = class MediaService {

    minimumTranscripts = 2;

    constructor(locator) {
        this.locator = locator;
    }

    save(mediaMetaData, createdBy) {
        var _this = this;
        mediaMetadata.transcripts = [];
        mediaMetadata.createdBy = createdBy;
        mediaMetadata.createdOn = new Date();
        mediaMetadata.status = 'NEW';

        return this.locator.db.insert('media', mediaMetaData).then(function () {
            _this.locator.logger.debug('Data saved to the database');
        });
    }

    get(mediaId) {
        return this.locator.db.findOne('media', { id: imageId });
    }

    addTranscript(mediaId, transcriptText, createdBy) {

        let transcript = {
            id: shortId.generate(),
            text: transcriptText,
            createdBy: createdBy,
            createdOn: new Date(),
            isApproved: false,
            approvedBy: null,
            approvedOn: null
        };

        return this.locator.db.update('media',
            { id: mediaId },
            { $set: { status: 'IN_PROGRESS' }, $addToSet: { transcripts: transcript } })
            .then(function () {
                _this.locator.logger.debug('Data saved to the database');
            });
    }

    getTranscriptPendingMedia() {

        return this.locator.db.aggregate('media', [
            {
                $project: {
                    id: 1,
                    media: 1,
                    createdOn: 1,
                    transcriptsCount: { $size: "$transcripts" }
                }
            },
            { $match: { transcriptsCount: { $lt: this.transcriptsCount } } },
            { $sort: { createdOn: 1, transcriptsCount: -1 } }
        ]);
    }

    getApprovalPendingMedia() {

        return this.locator.db.aggregate('media', [
            {
                $project: {
                    document: "$$ROOT",
                    createdOn: 1,
                    status: 1,
                    transcriptsCount: { $size: "$transcripts" }
                }
            },
            { $match: { status: 'IN_PROGRESS', transcriptsCount: { $gte: this.transcriptsCount } } },
            { $sort: { createdOn: 1 } }
        ]).then(function (results) {
            return results.map(function (result) {
                return result.document;
            });
        });
    }

    approveTranscript(transcriptId, approvedBy) {

        return this.locator.db.update('media',
            { transcripts: { $elemMatch: { id: transcriptId } } },
            { $set: { status: "COMPLETED", "transcripts.$.isApproved": true, "transcripts.$.approvedBy": approvedBy, "transcripts.$.approvedOn": new Date() } })
            .then(function () {
                _this.locator.logger.debug('Data saved to the database');
            });
    }
}
