
class FileLogger {

    constructor() {
    }

    /**
     * Debug logs
     */
    debug(message) {
        consol.log('-- file logger not implemented --- ');
        console.log(message);
    }

    /**
     * Debug logs
     */
    info(message) {
        consol.log('-- file logger not implemented --- ');
        console.log(message);
    }

    /**
     * Error logs
     */
    error(message) {
        consol.log('-- file logger not implemented --- ');
        console.error(message);
    }
}

module.exports = new FileLogger();