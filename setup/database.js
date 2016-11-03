
let MongoClient = require('mongodb').MongoClient;
let nconf = require('nconf');

class Database {

    constructor(name) {
        global.locator = global.locator || {};
    }

    /**
     * Initialise the setup : connects to the mongdb
     */
    init() {
        let _this = this;
        return new Promise(function (resolve, reject) {

            var url = nconf.get('mongo:url');
            MongoClient.connect(url, function (err, db) {
                _this.db = db;
                global.locator.db = _this;
                resolve();
            });
        });
    }

    /**
     * Inserts a single document in to the collection
     */
    insert(type, document) {

        let _this = this;

        return new Promise(function (resolve, reject) {

            var collection = _this.db.collection(type);
            collection.insertMany([document], function (err, result) {

                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Updates the given fields in all documents returned by the query
     */
    update(type, query, dataToUpdate) {

        let _this = this;
        return new Promise(function (resolve, reject) {
            var collection = _this.db.collection(type);

            collection.update(query, { $set: dataToUpdate }, function (err, result) {

                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Finds a single document from the collection
     */
    findOne(type, query) {

        let _this = this;
        return new Promise(function (resolve, reject) {

            var collection = _this.db.collection(type);
            let cursor = collection.find(query);

            cursor.toArray(function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        });
    }
}

module.exports = new Database();