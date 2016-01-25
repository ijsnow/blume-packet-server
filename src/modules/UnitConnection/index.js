"use strict";

const defaultUnit = require('../defaultUnit');
const config = require('../config');
const EVENTS = config.EVENTS;
const TRANSACTION_TYPES = config.TRANSACTION_TYPES;
const coll = 'units';

class UnitConnection { 
  /**
   * Handles the connection with the units collection.
   * @constructor
   * @param {Number} id - ID of the unit.
   */
  constructor(id) {
    this._id = id;
    
    // Used to keep track of db transactions that we need to wait for callbacks for. 
    this.pendingTransactions = 3;
  }
  
  /**
   * Initiates the transactions to the db.
   * @function
   * @void
   * @param {https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/db.js} db - The mongo db object.
   * @param {../ConnectionEventEmitter} connectionEventEmitter - The emitter for handling transactions with the db. 
   */
  initTransactions(db, connectionEventEmitter) {
    // This is a function to ensure that we get the latest collection each time we access it.
    this._collection = db.collection(coll);
    
    // Event emitter used to emit an event when a pending transaction with the db is completed.
    this._emitter = connectionEventEmitter;
    this._fetchUnit();
  }
  
  /* 
   * "Private" methods 
   */
  
  /**
   * Queries the collection for the unit. If it exists, we get its settings and 
   * then emit the TRANSACTION_COMPLETED event.
   * It the unit doesn't exist we create the unit and set the settings to the default settings. 
   * Finally we emit the GOT_SETTINGS event so we can respond to the request. 
   * @function
   * @void
   */
  _fetchUnit() {
    // Use .find(...).limit(1).next(...) to get the unit instead of .findOne because:
    // https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/collection.js#L1316
    this._collection.find( { unitId: this._id } ).limit(1).next((err, doc) => {
      // If we get an error, the unit does not exist yet. 
      // Let's create it and set the settings to the defaults.
      if (!doc) { 
        this._insert();
        this._settings = defaultUnit.settings;
      } else {
        // Otherwise set the settings and tell the emitter that the unit exists.
        this._settings = doc.settings;
        this._emitter.emit(EVENTS.TRANSACTION_COMPLETED, TRANSACTION_TYPES.UNIT_EXISTS);
      }
      
      // Emit GOT_SETTINGS event. 
      this._gotSettings();
    });
  }
  
  /**
   * Emits the GOT_SETTINGS event so we can respond to the request. 
   * @function
   * @void
   */
  _gotSettings() {
    this._emitter.emit(EVENTS.GOT_SETTINGS, this._currentSettings());
  }
  
  /**
   * Gets the current settings for this unit and turns it into JSON.
   * @function
   * @return {String(JSON)} The settings for this unit as a JSON string.
   */
  _currentSettings() {
    return JSON.stringify(this._settings);
  }

  /**
   * Inserts a new unit into the db. The callback emits the event to let the ConnectionEventEmitter 
   * know that the transaction was completed. 
   * @function
   * @void
   */
  _insert() {
    this._collection.insertOne({
      "unitId": this._id,
      "name": "Unit " + this._id,
      "settings": defaultUnit.settings,
      "createdAt": new Date()
      }, (err, doc) => {
        if (err) throw err;
        
        this._emitter.emit(EVENTS.TRANSACTION_COMPLETED, TRANSACTION_TYPES.UNIT_EXISTS);
    });
  }
}

module.exports = UnitConnection;
