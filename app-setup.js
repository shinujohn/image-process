
let nconf = require('nconf');
let shortId = require('shortid');
let path = require("path");
let fs = require('fs');
let bodyParser = require('body-parser');
let jwt = require('express-jwt');

class Setup {

    /**
     * Initialise the setup 
     */
    async init(app) {

        nconf.argv()
            .env()
            .file({ file: path.join(__dirname, 'config.json') });

        app.use(bodyParser.json());

        // Auth
        app.use('/api', jwt({
            secret: nconf.get('config').jwtSecret,
            requestProperty: '_token',

            getToken: function fromHeaderOrQuerystring(req) {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1];
                } else if (req.query && req.query.token) {
                    return req.query.token;
                } else if (req.query && req.query.api_key) {
                    return req.query.api_key;
                }
                return null;
            }
        }), (req, res, next) => {

            if (req.method === 'OPTIONS') {
                next();
            } else if (!req._token) {
                res.send(401);
            } else {
                req.clientContext = req._token.principal;
                next();
            }
        });

        let setupFilesPath = path.join(__dirname, "setup");
        let respondersPath = path.join(__dirname, "responders");

        // TODO: order of setup
        var setupFiles = fs.readdirSync(setupFilesPath);
        for (var i = 0; i < setupFiles.length; i++) {

            var setupFile = setupFiles[i];
            console.log('starting setup ' + setupFile);
            var a = await (require("./setup/" + setupFile)).init(app);
            console.log('setup complete ' + setupFile);
        }

        let logger = global.locator.logger;

        fs.readdirSync(respondersPath).forEach(function (responder) {
            require("./responders/" + responder).handle(app);
            logger.debug('registered ' + responder);
        });

        logger.debug('setup complete');
    }
}

module.exports = new Setup();