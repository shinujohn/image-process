
let MongoClient = require('mongodb').MongoClient;
let nconf = require('nconf');
let shortId = require('shortid');

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

            var url = nconf.get('config:mongo:url');
            MongoClient.connect(url, function (err, db) {
                _this.db = db;
                global.locator.database = _this;
                resolve();
            });
        });
    }

    /**
     * Inserts a single document in to the collection
     */
    insert(type, document) {

        let _this = this;
        document.id = shortId.generate();

        return new Promise(function (resolve, reject) {

            var collection = _this.getCollection(type);
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
     * Updates the given data in all documents returned by the query
     */
    update(type, query, dataToUpdate) {

        let _this = this;
        return new Promise(function (resolve, reject) {
            var collection = _this.getCollection(type);

            collection.update(query, dataToUpdate, function (err, result) {

                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result.document);
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

            var collection = _this.getCollection(type);
            collection.findOne(query, function (err, result) {
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
   * Finds all documents from the collection which satisfies the condition
   */
    find(type, query, options) {

        let _this = this;
        return new Promise(function (resolve, reject) {

            var collection = _this.getCollection(type);
            let cursor = collection.find(query);

            // Sort
            if (options && options.orderby) {
                cursor.sort(options.orderby);
            }

            // Projection
            if (options && options.fields) {

                var fields = options.fields.map(function (fieldName) {
                    var field = {};
                    field[fieldName] = 1;
                    return field;
                });

                cursor.project(fields);
            }

            cursor.toArray(function (err, result) {
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
   * Performs aggretagion
   */
    aggregate(type, pipeline) {

        let _this = this;
        return new Promise(function (resolve, reject) {

            var collection = _this.getCollection(type);
            let cursor = collection.aggregate(pipeline);

            cursor.toArray(function (err, result) {
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
     * Reset the database 
     * Used for test setup only
     */
    reset() {
        let _this = this;
        return new Promise(function (resolve, reject) {

            _this.db.collections(function (err, collections) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    var promises = [];
                    collections.forEach(function (collection) {
                        promises.push(_this.dropCollection(collection));
                    });

                    Promise.all(promises).then(function () {
                        resolve();
                    });
                }
            });
        });

    }

    /**
     * Drops the given collection
     * @param {*} collectionName 
     */
    dropCollection(collection) {

        let _this = this;
        return new Promise(function (resolve, reject) {
            collection.drop(function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });;
        });

    }

    /**
     * Ping the db server
     */
    ping() {

        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.command({ ping: 1 }, function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    getCollection(type) {
        return this.db.collection((process.env.ENV_NAME || '') + '_' + type);
    }
}

module.exports = new Database();