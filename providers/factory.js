

class Factory {

    constructor() {
    }

    /**
     * Gets the given provider for file storage
     */
    static getStorageProvider(name) {
        return require(`./storage/${name}`);
    }

    /**
     * Gets the given provider for logging
     */
    static getLogger(name) {
        return require(`./logger/${name}`);
    }

}

module.exports = Factory;