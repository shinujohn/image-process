let express = require('express');
let shortId = require('shortid');
let path = require("path");
let fs = require('fs');
let bodyParser = require('body-parser');
let nconf = require('nconf');

let app = express();
let setupFilesPath = path.join(__dirname, "setup");
let respondersPath = path.join(__dirname, "responders");

nconf.argv()
    .env()
    .file({ file: path.join(__dirname, 'config.json') });

app.use(bodyParser.json());

let setpInProgress = [];

fs.readdirSync(setupFilesPath).forEach(function (setupFile) {
    setpInProgress.push(require("./setup/" + setupFile).init(app));
    console.log('setup initialized ' + setupFile);
});

Promise.all(setpInProgress).then(function () {

    let logger = global.locator.logger;
    logger.debug('setup complete');

    fs.readdirSync(respondersPath).forEach(function (responder) {
        require("./responders/" + responder).handle(app);
        logger.debug('registered ' + responder);
    });

    let port = process.env.PORT || Math.ceil(Math.random() * 10000);
    app.listen(port, function () {
        logger.debug('app listening on port ' + port);
    });

}).catch(function (err) {
    console.error('setup error');
    console.error(err);
});