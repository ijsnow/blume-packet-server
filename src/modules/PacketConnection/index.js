"use strict";

const url = require('url');
const config = require('../config');
const EVENTS = config.EVENTS;
const TRANSACTION_TYPES = config.TRANSACTION_TYPES;
const coll = 'packets';

class PacketConnection {
  /**
   * Handles the connection with the packets collection.
   * @constructor
   * @param {string} path - Path from the req.url. Parsed to create the packet.
   */
  constructor(path) {
    this._packet = this._parseUrl(path);
    this.pendingTransaction = 1;
  }

  /**
   * Initiates the transactions to the db.
   * @function
   * @void
   * @param {https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/db.js} db - The mongo db object.
   * @param {function} callback - Callback used to disconnect the connection to the db if all trancasctions have been completed.
   */
  initTransactions(db, connectionEventEmitter) {
    this._collection = db.collection(coll);
    this._emitter = connectionEventEmitter;
    this._insert();
  }

  /**
   * Gets the ID of the unit this packet came from.
   * @function
   * @return {Number} The ID of the unit.
   */
  getUnitId() {
    return this._packet.unitId;
  }

  /*
   * "Private" methods
   */

  /**
   * Inserts the packet into the db. Then emits the TRANSACTION_COMPLETED event.
   * @function
   * @void
   */
  _insert() {
    this._collection.insertOne({
      unitId: this._packet.unitId,
      temperature: this._packet.temperature,
      water: this._packet.water,
      light: this._packet.light,
      raw: this._packet.raw,
      createdAt: new Date()
    })
    // Use an arrow function to bind 'this' to the function
    .then(() => {
      // Emit the TRANSACTION_COMPLETED to see if we can disconnect from the db.
      this._emitter.emit(EVENTS.TRANSACTION_COMPLETED, TRANSACTION_TYPES.PACKET_INSERTED);
    }).catch((err) => { throw err; });
  }

  /**
   * Parses the url and returns the packet as an object.
   * @function
   * @param {string} path - The path from the req.url. This is parsed to create the packet object.
   * @return {object} The settings for this unit.
   */
  _parseUrl(path) {
    let packet = url.parse(path, true).query;
    packet.raw = path;

    return packet;
  }
}

module.exports = PacketConnection;
