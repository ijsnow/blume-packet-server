"use strict";

const EventsEmitter = require('events');
const config = require('../config');
const EVENTS = config.EVENTS;
const TRANSACTION_TYPES = config.TRANSACTION_TYPES;

class ConnectionEventEmitter extends EventsEmitter {
  /**
   * Used to emit an event when a transaction is completed with the db so we can check if we can close the db.
   * @constructor
   * @param {https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/db.js} db - The mongo db object.
   */
  constructor(db, res) {
    super();
    
    this._db = db;
    this._res = function () { return res; };
    
    // Set the transaction types so we can keep track if they are completed or not. 
    this._pendingTransactions = {};
    this._pendingTransactions[TRANSACTION_TYPES.UNIT_EXISTS] = false;
    this._pendingTransactions[TRANSACTION_TYPES.PACKET_INSERTED] = false;
    
    // Ensure 'this' gets binded to the methods being emitted. 
    // I'm not sure what 'this' would be when the event gets emitted otherwise.
    this._pendingTransactionHandler = this._pendingTransactionHandler.bind(this);
    this._respond = this._respond.bind(this);
    
    // Register the events to be emitted.
    this.on(EVENTS.TRANSACTION_COMPLETED, this._pendingTransactionHandler);
    this.on(EVENTS.GOT_SETTINGS, this._respond);
  }
  
  /*
   * "Private" Methods
   */
  
  /**
   * This function will be called each time a transaction is completed with the db. 
   *   Sets the transaction type to be completed then calls _diconnect to see if we can disconnect the db.
   *   Needed so that we don't close the connection until all of them are done. 
   * @function
   * @private
   * @void
   */
  _pendingTransactionHandler(type) {
    this._pendingTransactions[type] = true;
    console.log(`Transaction type of '${type}' completed`);
    // Try to disconnect the db
    this._disconnect();
  }
  
  /**
   * Checks if each transaction is completed and then disconnects the db.
   * @function
   * @private
   * @void
   */
  _disconnect() {
    if (this._pendingTransactionsCompleted()) {
      this._db.close();
      console.log("DB closed");
    }
  }
  
  /**
   * Checks if each transaction is completed and then disconnects the db.
   * @function
   * @private
   * @returns {Boolean} true if transactions are completed, false otherwise
   */
  _pendingTransactionsCompleted() {
    return this._pendingTransactions[TRANSACTION_TYPES.UNIT_EXISTS] &&
           this._pendingTransactions[TRANSACTION_TYPES.PACKET_INSERTED];
  }
  
  /**
   * Responds to the request with the settings for the unit in JSON format.
   * Emitted once we have the current settings for the unit.
   * @function
   * @private
   * @param {String} message - The settings for this unit in JSON format.
   * @returns {Boolean} true if transactions are completed, false otherwise
   */
  _respond(message) {
    const res = this._res();
    console.log("Responding with: " + message);
    // Respond to request. 
    res.writeHead(200, { "Content-type": "text/json" });
    // Respond with settings in JSON form.
    res.write(message);
    res.end();
  }
}

module.exports = ConnectionEventEmitter;
