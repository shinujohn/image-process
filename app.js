let express = require('express');
let setup = require('./app-setup');

let app = express();



setup.init(app).then(function () {

    let logger = global.locator.logger;
    let port = process.env.PORT || '3065';
    app.listen(port, function () {
        logger.debug('app listening on port ' + port);
        app.emit("app-started");
    });

}).catch(function (err) {
    console.error('setup error');
    console.error(err);
});

module.exports = app;