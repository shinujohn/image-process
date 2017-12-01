let shortId = require('shortid');

/**
 * Methods to handle the transcript operations
 */
module.exports = class TranscriptService {

    /**
     * Creates a new instance of this service
     * @param {*} locator 
     * @param {*} clientContext 
     */
    constructor(locator, clientContext) {
        this.locator = locator;
        this.minimumTranscriptsRequired = locator.config.minimumTranscriptsRequired || 1;
        this.clientContext = clientContext;
    }

    /**
     * Creates a new transcription request with status 'NEW'
     * @param {*} transcriptionRequest 
     */
    createRequest(transcriptionRequest) {

        var _this = this;
        transcriptionRequest.createdBy = {
            id: this.clientContext.id,
            name: this.clientContext.name,
        };
        transcriptionRequest.createdOn = new Date();
        transcriptionRequest.status = 'NEW';

        return this.locator.database.insert('TranscriptRequests', transcriptionRequest).then(function (result) {
            _this.locator.logger.debug('Data saved to the database');
            return result;
        });
    }

    /**
     * Retrieves a list of untranscripted requests
     * TODO: enable pagination
     */
    getUnTranscriptedRequests() {

        var _this = this;
        var aggregationQuery = [
            {
                "$lookup": {
                    "from": "Transcripts",
                    "localField": "id",
                    "foreignField": "requestId",
                    "as": "transcripts"
                }
            },
            {
                "$project": {
                    "id": 1,
                    "timestamp": 1,
                    "status": 1,
                    "transcriptsCount": {
                        "$size": "$transcripts"
                    }
                }
            },
            {
                "$match": {
                    "$and": [
                        {
                            "transcriptsCount": {
                                "$lt": this.locator.config.minimumTranscriptsRequired
                            }
                        },
                        {
                            "status": {
                                "$ne": "APPROVED"
                            }
                        }
                    ]
                }
            },
            {
                "$sort": {
                    "createdOn": 1,
                    "transcriptsCount": 1
                }
            }
        ];

        return this.locator.database.aggregate('TranscriptRequests', aggregationQuery);
    }

    /**
     * Creates a new transcript against a request 
     * @param {*} transcript 
     */
    createTranscript(transcript) {

        var _this = this;
        if (!transcript.requestId) {
            return new Promise(function (resolve, reject) {
                reject('Request ID not specified');
            });
        }

        transcript.createdBy = {
            id: this.clientContext.id,
            name: this.clientContext.name,
        };
        transcript.createdOn = new Date();
        transcript.isApproved = false;
        transcript.approvedBy = null;
        transcript.approvedOn = null;

        return this.locator.database.insert('Transcripts', transcript).then(function (result) {
            _this.locator.logger.debug('Data saved to the database');
            return result;
        });
    }

    /**
     * Gets a list of requests for which transcripts completed but approval pending
     * TODO: enable pagination
     */
    getApprovalPendingRequests() {

        var _this = this;
        var aggregationQuery = [
            {
                "$lookup": {
                    "from": "Transcripts",
                    "localField": "id",
                    "foreignField": "requestId",
                    "as": "transcripts"
                }
            },
            {
                "$project": {
                    "id": 1,
                    "timestamp": 1,
                    "status": 1,
                    "transcripts": 1,
                    "transcriptsCount": {
                        "$size": "$transcripts"
                    }
                }
            },
            {
                "$match": {
                    "$and": [
                        {
                            "transcriptsCount": {
                                "$gte": this.locator.config.minimumTranscriptsRequired
                            }
                        },
                        {
                            "status": {
                                "$ne": "APPROVED"
                            }
                        }
                    ]
                }
            },
            {
                "$sort": {
                    "createdOn": 1
                }
            }
        ];

        return this.locator.database.aggregate('TranscriptRequests', aggregationQuery);
    }

    /**
     * Marks a transcription as Approved
     * @param {*} transcriptId 
     */
    approveTranscript(transcriptId) {

        var _this = this;
        if (!transcriptId) {
            return new Promise(function (resolve, reject) {
                reject('Invalid transcriptId');
            });
        }

        var transcriptApprovalData = {
            $set: {
                approvedBy: {
                    id: this.clientContext.id,
                    name: this.clientContext.name
                },
                approvedOn: new Date(),
                isApproved: true
            }
        };

        return this.locator.database.update('Transcripts', { id: transcriptId }, transcriptApprovalData).then(function (result) {
            _this.locator.logger.debug('Data saved to the database');
            return result;
        });
    }

    /**
     * Retrieves a request by its ID
     */
    getRequestById(requestId) {

        var _this = this;
        if (!requestId) {
            return new Promise(function (resolve, reject) {
                reject('Invalid requestId');
            });
        }

        var aggregationQuery = [{
            "$match": {
                "id": requestId
            }
        },
        {
            "$lookup": {
                "from": "Transcripts",
                "localField": "id",
                "foreignField": "requestId",
                "as": "transcripts"
            }
        },
        {
            "$project": {
                "id": 1,
                "timestamp": 1,
                "status": 1,
                "transcripts": 1
            }
        }];

        return this.locator.database.aggregate('TranscriptRequests', aggregationQuery).then(function (data) {
            if (data && data.id) {
                return data;
            } else {
                throw new Error('Invalid requestId');
            }
        });

    }

    getRequestsByOwningUser() {
        return new Promise(function (resolve, reject) {
            reject('Not implemented');
        });
    }

    getTranscriptsByOwningTranscriptor() {
        return new Promise(function (resolve, reject) {
            reject('Not implemented');
        });
    }

    getTranscriptsByApprover() {
        return new Promise(function (resolve, reject) {
            reject('Not implemented');
        });
    }
}
