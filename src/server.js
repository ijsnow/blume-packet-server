var http = require('http'),
    MongoClient = require('mongodb').MongoClient,
    UnitConnection = require('./modules/UnitConnection'),
    PacketConnection = require('./modules/PacketConnection'),
    url = "http://localhost",
    port = 3000;

http.createServer(function (req, res) {
  // Connect to the database
  MongoClient.connect(url, function(err, db) {
    // This function will be called by each query that requires a callback and or 
    // would return a promise if not passed a callback.
    // This is a "curry"'ed function.
    // Needed so that we don't close the connection until all of them are done. 
    // @param otherConnection: type: UnitConnection or PacketConnection 
    //    The istance of the connection class that is not calling the function.
    // @param db: type: https://github.com/mongodb/node-mongodb-native/blob/2.1/lib/db.js
    //    Used to interact with the database.
    var _disconnect = function (otherConnection, dbConnection) {
      // Returns a function that will be used to check if the queries in both the Connection objects are completed
      // then closes the connection to the db. 
      // @param currentConnection: type UnitConnection or PacketConnection(The opposite of otherConnection)
      //   The instance of the connection class that is calling this function.
      return function (currentConnection) {
        var allTransactionsCompleted = function (connection) {
          return connection.pendingTransactions === 0;
        }; 
        // If all pending transactions are done, close the connection.
        if (allTransactionsCompleted(currentConnection) && 
            allTransactionsCompleted(otherConnection)) {
          dbConnection.close();        
        }
      };
    };    
    
    var packet = new PacketConnection(packet),
        unit = new UnitConnection(packet.getUnitId());
    
    // Initiate transactions.
    packet.initTransactions(db, _disconnect(unit, db));
    unit.initTransactions(db, _disconnect(packet, db));
    
    // Respond to request. 
    res.writeHead(200, { "Content-type": "text/json" });
    res.write(unit.currentSettings());
    res.end();
  });
}).listen(port);

console.log('Server running at ' + url + ':' + port);