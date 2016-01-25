"use strict";

const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const UnitConnection = require('./modules/UnitConnection');
const PacketConnection = require('./modules/PacketConnection');
const ConnectionEventEmitter = require('./modules/ConnectionEventEmitter');
const MONGO_URL = "mongodb://localhost:27017/test";
const URL = "http://localhost";
const PORT = 3000;

http.createServer(function (req, res) {
  console.log("res: " + res);
  console.log("req: " + req);
  if (req.url) {
    // Connect to the database
    console.log("Recieved request. Connecting to MongoDB...");
    //Connect to the database
    MongoClient.connect(MONGO_URL, function(err, db) {
      console.log("Connected to MongoDB.");
      
      // Initialize the connection objects.
      const packet = new PacketConnection(req.url);
      const unit = new UnitConnection(packet.getUnitId());
      const connectionEventEmitter = new ConnectionEventEmitter(db, res);

      // Initiate transactions.
      packet.initTransactions(db, connectionEventEmitter);
      unit.initTransactions(db, connectionEventEmitter);
    });
  }
}).listen(PORT);

console.log('Server running at ' + URL + ':' + PORT);
