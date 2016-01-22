var url = require('url'),
    coll = 'packets';

class PacketConnection {
  /**
   * Handles the connection with the packets collection.
   * @constructor
   * @param {string} path - Path from the req.url. Parsed to create the packet.
   */
  constructor(path, db) {
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
  initTransactions(db, callback) {
    this._collection = db.collection(coll);
    this._callback = callback;
    
    this._save();
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
   * Inserts the packet into the db.
   * @function
   * @void
   */
  _save() {
    // Register the pending transaction.
    this.pendingQueries = this.pendingTransaction + 1;
    
    this._collection.insertOne({
      unitId: this._packet.unitId,
      temperature: this._packet.temperature,
      water: this._packet.water,
      light: this._packet.light,
      raw: this._packet.raw,
      createdAt: new Date()
    }, 
    // Use an arrow function to bind 'this' to the function
    (err) => {
      if (err) throw err;
      
      // Remove the pending transaction from the count.
      this.pendingTransaction = this.pendingTransaction - 1;
      
      // Initiate callback (_disconnect in server.js)
      this._callback(this);
    });
  }

  /**
   * Parses the url and returns the packet as an object.
   * @function
   * @param {string} path - The path from the req.url. This is parsed to create the packet object.
   * @return {object} The settings for this unit.
   */
  _parseUrl(path) {
    // Parse url to create the packet
    return {};
  }
}

module.exports = PacketConnection;
