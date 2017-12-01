var request = require('supertest');
var app = require('../../app');
var appSetup = require('../../app-setup');
var assert = require('chai').assert;
var auth_dummyuser = '';

before(function () {
    return new Promise(function (resolve, reject) {

        // how to use test database
        // https://stackoverflow.com/questions/35230489/use-different-database-for-the-npm-test-phase

        process.env.ENV_NAME = 'INTEGRATION_TEST';
        app.on("app-started", function () {
            global.locator.database.reset().then(function () {
                resolve();
            });
        });
    });
});

after(function () {
    delete process.env.ENV_NAME;
});


describe('Ping', function () {

    // how to set common things (like headers)

    it('should respond to ping', function (done) {
        request(app)
            .get('/ping')
            .set({
                Accept: 'application/json'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.body.api, "success");
                assert.equal(res.body.db, "success");
                done();
            });
    });
});

describe('TranscriptRequests', function () {
    // it('should create a new transcript request on [POST]/api/v1/transcriptRequests');
    // it('should get a transcript request on [GET]/api/v1/transcriptRequests/:transcriptRequestId');
    // it('should save a trascription request media file on [POST]/api/v1/transcriptRequests/:transcriptRequestId/media');
    // it('should get the trascription request media file on [GET]/api/v1/transcriptRequests/:transcriptRequestId/media');

    // it('should search for untranscripted requests on [POST]/api/v1/transcriptRequests/searches');
    // it('should search for approval-pending requests on [POST]/api/v1/transcriptRequests/searches');
});

describe('Transcripts', function () {
    // it('should create a new transcript on [POST]/api/v1/transcripts');
    // it('should get a transcript on [GET]/api/v1/transcripts/:transcriptId');
    // it('should update a transcript on [PUT]/api/v1/transcripts/:transcriptId');
    // it('should approve a transcript by updating it on [PUT]/api/v1/transcripts/:transcriptId/status');
    // it('should search for transcripts by request ID on [POST]/api/v1/transcripts/searches'); 
});
