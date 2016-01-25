This will be the server that communicates with the units. 
Will likely be at packets.blumemicrofarms.com

Listens for GET requests coming from units. 
When a request has been made the server responds with the unit's current settings. 

General Process:
  Recieve request
  Parse url to create packet
  Add packet to DB
  Check if unit exists in the DB yet
  If not, create unit
  Respond to the request with the units settings.
