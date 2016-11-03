let path = require('path');
let fs = require('fs');
let nconf = require('nconf');
let amqp = require('amqp');

class Queue {

  constructor(name) {
    global.locator = global.locator || {};
  }

  /**
   * Initiizes a AMQP queue
   */
  init() {

    let _this = this;
    return new Promise(function (resolve, reject) {

      let connection = amqp.createConnection(nconf.get('queue'));

      connection.on('error', function (e) {
        console.error("Error from amqp: ", e);
      });

      connection.on('ready', function () {

        global.locator.queue = _this;

        _this.connection = connection;
        _this.registerConsumers().then(function () {
          resolve();
        });
      });
    });

  }

  /**
   * Registeres all consumers
   */
  registerConsumers() {

    let consumersPath = path.join(__dirname, "./../consumers");
    let promises = [];
    try {
      fs.readdirSync(consumersPath).forEach(function (consumerFile) {
        let consumer = require("./../consumers/" + consumerFile);
        promises.push(global.locator.queue.subscribe(consumer.topic, consumer.handle));
      });
    } catch (err) {
      if (err && err.code != 'ENOENT') {
        console.error(err);
      }
    }

    return Promise.all(promises);
  }

  /**
   * Suscribes to the given topic
   */
  subscribe(topic, handler) {

    let _this = this;
    _this.handlers = _this.handlers || {};
    _this.handlers[topic] = _this.handlers[topic] || [];
    _this.handlers[topic].push(handler);

    return new Promise(function (resolve, reject) {

      _this.connection.queue(topic, { durable: true }, function (q) {

        q.bind(topic);
        q.subscribe(function (message, headers) {

          _this.handlers[topic].forEach(function (handler) {
            handler(message, headers);
          });
        });

        resolve();
      });
    });
  }

  /**
   * Publishes a new message on the given topic
   */
  publish(topic, message) {

    let _this = this;
    return new Promise(function (resolve, reject) {

      _this.connection.publish(topic, message, null, function () {
        resolve();
      });
    });
  }
}

module.exports = new Queue();