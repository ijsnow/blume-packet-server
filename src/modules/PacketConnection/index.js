var url = require('url'),
    _ = require('lodash'),
    coll = 'packets';
    
/**
 * Handles the connection with the packets collection.
 * @constructor
 * @param {string} path - Path from the req.url. Parsed to create the packet.
 */
function PacketConnection (path, db) {
  this._packet = this._parseUrl(path);
  this.pendingTransaction = 0;
}

/**
 * Initiates the transactions to the db.
 * @function
 * @void
 * @param {https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/db.js} db - The mongo db object.
 * @param {function} callback - Callback used to disconnect the connection to the db if all trancasctions have been completed.
 */
PacketConnection.prototype.initTransactions = function (db, callback) {
  this._collection = db.collection(coll);
  this._callback = callback;
  
  this._save();
};

/**
 * Gets the ID of the unit this packet came from.
 * @function
 * @return {Number} The ID of the unit.
 */
PacketConnection.prototype.getUnitId = function () {
  return this._packet.unitId;
};

/* 
 * "Private" methods 
 */

/**
 * Inserts the packet into the db.
 * @function
 * @void
 */
PacketConnection.prototype._save = function () {
  // Register the pending transaction.
  this.pendingQueries = this.pendingTransaction + 1;
  
  return this._collection.insert({
    unitId: this._packet.unitId,
    temperature: this._packet.temperature,
    water: this._packet.water,
    light: this._packet.light,
    raw: this._packet.raw,
    createdAt: new Date()
  }, 
  // Use _.bind to bind 'this' to the function until we get ES6 in here and use an arrow function. 
  _.bind(function (err) {
    if (err) throw err;
    
    // Remove the pending transaction from the count.
    this.pendingTransaction = this.pendingTransaction - 1;
    
    // Initiate callback (_disconnect in server.js)
    this._callback(this);
  }, this));
};

/**
 * Parses the url and returns the packet as an object.
 * @function
 * @param {string} path - The path from the req.url. This is parsed to create the packet object.
 * @return {object} The settings for this unit.
 */
PacketConnection.prototype._parseUrl = function (path) {
  // Parse url to create the packet
  return {};
};

module.exports = PacketConnection;
