
class ConsoleLogger {

    constructor() {
    }

    /**
     * Debug logs
     */
    debug(message) {
        console.log(message);
    }

    /**
     * Debug logs
     */
    info(message) {
        console.log(message);
    }

    /**
     * Error logs
     */
    error(message) {
        console.error(message);
    }
}

module.exports = new ConsoleLogger();