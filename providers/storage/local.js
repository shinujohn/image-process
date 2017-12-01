
let fs = require('fs');
class LocalStorage {

    constructor() {
        this.path = './uploadedmedia';
    }

    /**
     * Gets a stream to write to local file storage
     */
    getWritableStream(filename, callback) {
        let writeStream = fs.createWriteStream(`${this.path}/${filename}`);
        writeStream.on('finish', callback);
        return writeStream;
    }

    /**
     * Read the file and writes its to given stream
     */
    getReadableStream(filename, writeStream, callback) {
        let readStream = fs.createReadStream(`${this.path}/${filename}`);
        readStream.pipe(writeStream);
        readStream.on('finish', callback);
        return readStream;
    }
}

module.exports = new LocalStorage();