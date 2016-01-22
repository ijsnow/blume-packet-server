var defaultUnit = require('../defaultUnit'),
    coll = 'units';

class UnitConnection { 
  /**
   * Handles the connection with the units collection.
   * @constructor
   * @param {Number} id - ID of the unit.
   */
  constructor(id) {
    this._id = id;
  
    // Used to keep track of db transactions that we need to wait for callbacks for. 
    this.pendingTransactions = 0;
  }
  
  /**
   * Initiates the transactions to the db.
   * @function
   * @void
   * @param {https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/db.js} db - The mongo db object.
   * @param {function} callback - Callback used to disconnect the connection to the db if all trancasctions have been completed.
   */
  initTransactions(db, callback) {
    // This is a function to ensure that we get the latest collection each time we access it.
    this._collection = function() { return db.collection(coll); };
    // Callback used to disconnect the db.
    this._callback = callback;
    
    if (!this._exists()) {
      this._create();
    }
  }
  
  /**
   * Gets the current settings for this unit and turns it into JSON.
   * @function
   * @return {String(JSON)} The settings for this unit as a JSON string.
   */
  currentSettings() {
    return JSON.stringify(this._getSettings());
  }
  
  /* 
   * "Private" methods 
   */

  /**
   * Gets the current settings for this unit from the db.
   * @function
   * @return {object} The settings for this unit.
   */
  // Don't need to use a callback for this transaction.
  _getSettings () {
    return this._collection().find({ unitId: this._id }).settings;
  }

  /**
   * Gets the current settings for this unit.
   * @function
   * @return {object} The settings for this unit.
   */
  // Don't need to use a callback for this query.
  _exists() {
    return (this._collection().find({ unitId: this._id }).count() !== 0);
  }

  /**
   * Inserts a new unit into the db.
   * @function
   * @void
   */
  _create() {
    this.pendingQueries = this.pendingTransactions + 1;
    this._collection.insertOne({
      "unitId": this._id,
      "name": "Unit " + this._collection().find().count(),
      "settings": defaultUnit.settings,
      "createdAt": new Date()
      
      },
      // Use arrow function to bind 'this' to the function. 
      (err) => {
        if (err) throw err;
        
        // Remove the pending transaction from the count.
        this.pendingTransaction = this.pendingTransaction - 1;
        
        // Initiate callback (_disconnect in server.js)
        this._callback(this);
      });
  }
}

module.exports = UnitConnection;
