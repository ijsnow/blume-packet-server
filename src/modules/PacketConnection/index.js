var url = require('url'),
    _ = require('lodash'),
    coll = 'packets';

function PacketConnection (path, db) {
  this._packet = this._parseUrl(path);
  this.pendingTransaction = 0;
}

PacketConnection.prototype.initTransactions = function (db, callback) {
  this._collection = db.collection(coll);
  this._callback = callback;
  
  this._save();
};

PacketConnection.prototype.getUnitId = function () {
  return this._packet.unitId;
};

// "Private" methods
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
    // Use _.bind to bind 'this' to the function until we get ES6 in here and use an arrow function. 
  }, _.bind(function (err) {
    if (err) throw err;
    
    // Remove the pending transaction from the count.
    this.pendingTransaction = this.pendingTransaction - 1;
    
    // Initiate callback (_disconnect in server.js)
    this._callback(this);
  }, this));
};

PacketConnection.prototype._parseUrl = function (url) {
  // Parse url to create the packet
  return {};
};

module.exports = PacketConnection;
