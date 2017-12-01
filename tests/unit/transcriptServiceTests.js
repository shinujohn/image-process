var chai = require('chai');
var assert = require('chai').assert;
var shortId = require('shortid');
var sinon = require('sinon');
var chaiAsPromised = require("chai-as-promised");
var TranscriptService = require('./../../services/transcript');

chai.use(chaiAsPromised);

describe('Transcript Service', function () {
    var clientContext = {
        id: 'Unit_test_user',
        name: 'Unit test user'
    };

    var locator = {
        database: {
            insert: () => { },
            find: () => { },
            findOne: () => { },
            aggregate: () => { },
            update: () => { }
        },
        logger: {
            debug: () => { },
            info: () => { },
            error: () => { }
        },
        config: {
            minimumTranscriptsRequired: 2
        }
    };

    describe('createRequest()', function () {
        it('should save the request with status NEW', function () {

            var expectedCollectionName = 'TranscriptRequests';
            var exepectedDocument = {
                createdBy: {
                    id: clientContext.id,
                    name: clientContext.name
                },
                createdOn: sinon.match.date,
                status: 'NEW'
            };

            var database = sinon.mock(locator.database);
            database.expects('insert')
                .once()
                .withArgs(expectedCollectionName, exepectedDocument)
                .returns(new Promise(function (resolve, reject) {
                    resolve({ id: shortId.generate() });
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return transcriptService.createRequest({}).then(function (result) {

                assert.isOk(result && result.id, "Document save failed");
                database.verify();
                database.restore();
            });
        });
    });

    describe('getUnTranscriptedRequests()', function () {
        it('should return a list of requests which are not transcripted or approved', function () {

            var expectedAggregationCollectionName = 'TranscriptRequests';
            var expectedAggregationPipeline = [
                {
                    "$lookup": sinon.match.object
                },
                {
                    "$project": sinon.match.object,
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "transcriptsCount": {
                                    "$lt": locator.config.minimumTranscriptsRequired
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


            var database = sinon.mock(locator.database);
            database.expects('aggregate')
                .once()
                .withArgs(expectedAggregationCollectionName, expectedAggregationPipeline)
                .returns(new Promise(function (resolve, reject) {
                    resolve([
                        { id: "R1" },
                        { id: "R2" },
                        { id: "R3" }
                    ]);
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return transcriptService.getUnTranscriptedRequests().then(function (result) {

                assert.isOk(result && result.length === 3, 'Invalid db result');
                database.verify();
                database.restore();
            });
        });
    });

    describe('createTranscript()', function () {
        it('should save the transcript', function () {

            var expectedCollectionName = 'Transcripts';
            var exepectedDocument = {
                "requestId": "R2",
                "createdBy": {
                    id: clientContext.id,
                    name: clientContext.name
                },
                "createdOn": sinon.match.date,
                "isApproved": false,
                "approvedBy": null,
                "approvedOn": null
            };

            var database = sinon.mock(locator.database);
            database.expects('insert')
                .once()
                .withArgs(expectedCollectionName, exepectedDocument)
                .returns(new Promise(function (resolve, reject) {
                    resolve({ id: shortId.generate() });
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return transcriptService.createTranscript({ requestId: "R2" }).then(function (result) {

                assert.isOk(result && result.id, "Document save failed");
                database.verify();
                database.restore();
            });
        });

        it('should not save the transcript if no request ID is specified', function () {

            var database = sinon.mock(locator.database);
            database.expects('insert')
                .once()
                .returns(new Promise(function (resolve, reject) {
                    resolve(null);
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return assert.isRejected(transcriptService.createTranscript({})).then(function () {
                database.restore();
            });
        });
    });

    describe('getApprovalPendingRequests()', function () {
        it('should return the un approved transcripts, group by request', function () {

            var expectedAggregationCollectionName = 'TranscriptRequests';
            var expectedAggregationPipeline = [
                {
                    "$lookup": sinon.match.object
                },
                {
                    "$project": sinon.match.object,
                },
                {
                    "$match": {
                        "$and": [
                            {
                                "transcriptsCount": {
                                    "$gte": locator.config.minimumTranscriptsRequired
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


            var database = sinon.mock(locator.database);
            database.expects('aggregate')
                .once()
                .withArgs(expectedAggregationCollectionName, expectedAggregationPipeline)
                .returns(new Promise(function (resolve, reject) {
                    resolve([
                        { id: "R1" },
                        { id: "R2" },
                        { id: "R3" }
                    ]);
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return transcriptService.getApprovalPendingRequests().then(function (result) {

                assert.isOk(result && result.length === 3, 'Invalid db result');
                database.verify();
                database.restore();
            });
        });
    });

    describe('approveTranscript()', function () {
        it('should save the transcript with status APPROVED', function () {

            var expectedCollectionName = 'Transcripts';
            var expectedQuery = { id: "T2" };
            var exepectedDocument = {
                "$set": {
                    "approvedBy": {
                        id: clientContext.id,
                        name: clientContext.name
                    },
                    "approvedOn": sinon.match.date,
                    "isApproved": true
                }
            };

            var database = sinon.mock(locator.database);
            database.expects('update')
                .once()
                .withArgs(expectedCollectionName, expectedQuery, exepectedDocument)
                .returns(new Promise(function (resolve, reject) {
                    resolve({ id: "T2" });
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return transcriptService.approveTranscript("T2").then(function (result) {

                assert.isOk(result && result.id, "Document save failed");
                database.verify();
                database.restore();
            });
        });

        it('should not approve the transcript if no transcription ID is specified', function () {

            var database = sinon.mock(locator.database);
            database.expects('update')
                .once()
                .returns(new Promise(function (resolve, reject) {
                    resolve(null);
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return assert.isRejected(transcriptService.approveTranscript("")).then(function () {
                database.restore();
            });
        });
    });

    describe('getRequestById()', function () {

        it('should retrieve the request by its ID', function () {

            var expectedAggregationCollectionName = 'TranscriptRequests';
            var expectedAggregationPipeline = [{
                "$match": {
                    "id": "R1"
                }
            },
            {
                "$lookup": sinon.match.object
            },
            {
                "$project": sinon.match.object
            }];

            var database = sinon.mock(locator.database);
            database.expects('aggregate')
                .once()
                .withArgs(expectedAggregationCollectionName, expectedAggregationPipeline)
                .returns(new Promise(function (resolve, reject) {
                    resolve({ id: "R1" });
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return transcriptService.getRequestById('R1').then(function (result) {

                assert.isOk(result && result.id === 'R1', 'Invalid db result');
                database.verify();
                database.restore();
            });
        });

        it('should throw error if no request ID is specified', function () {

            var database = sinon.mock(locator.database);
            database.expects('aggregate')
                .once()
                .returns(new Promise(function (resolve, reject) {
                    resolve(null);
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return assert.isRejected(transcriptService.getRequestById()).then(function () {
                database.restore();
            });
        });

        it('should throw error if invalid ID is specified', function () {
            var database = sinon.mock(locator.database);
            database.expects('aggregate')
                .once()
                .returns(new Promise(function (resolve, reject) {
                    resolve(null);
                }));

            let transcriptService = new TranscriptService(locator, clientContext);
            return assert.isRejected(transcriptService.getRequestById('000')).then(function () {
                database.restore();
            });
        });
    });
});