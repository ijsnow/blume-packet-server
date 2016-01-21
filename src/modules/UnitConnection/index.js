var _ = require('lodash'),
    defaultUnit = require('../defaultUnit'),
    coll = 'units';

function UnitConnection (id) {
  this._id = id;
  
  // Used to keep track of db transactions that we need to wait for callbacks for. 
  this.pendingTransactions = 0;
}

UnitConnection.prototype.initTransactions = function (db, callback) {
  this._collection = db.collection(coll);
  this._callback = callback;
  
  if (!this._exists()) {
    this._create();
  }
};

UnitConnection.prototype.currentSettings = function () {
  return JSON.stringify(this._getSettings());
};

// "Private" methods
// Don't need to use a callback for this query.
UnitConnection.prototype._getSettings = function () {
  return this._collection.find({ unitId: this._id }).settings;
};

// Don't need to use a callback for this query.
UnitConnection.prototype._exists = function() {
  return (this._collection.find({ unitId: this._id }).count() !== 0);
};

UnitConnection.prototype._create = function() {
  this.pendingQueries = this.pendingTransactions + 1;
  this._collection.insertOne({
    "unitId": this._id,
    "name": "Unit " + this._db.collection(coll).find().count(),
    "settings": defaultUnit.settings,
    "createdAt": new Date()
    // Use _.bind to bind 'this' to the function until we get ES6 in here and use an arrow function. 
    // Use _.bind to bind 'this' to the function until we get ES6 in here and use an arrow function. 
    }, _.bind(function (err) {
      if (err) throw err;
      
      // Remove the pending transaction from the count.
      this.pendingTransaction = this.pendingTransaction - 1;
      
      // Initiate callback (_disconnect in server.js)
      this._callback(this);
    }, this));
};

module.exports = UnitConnection;
