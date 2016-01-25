This will be the server that communicates with the units. 
Will likely be at packets.blumemicrofarms.com

Listens for GET requests coming from units. 
When a request has been made the server responds with the unit's current settings. 

General Process:
1. Recieve request
2. Parse url to create packet
3. Add packet to DB
4. Check if unit exists in the DB yet
5. If not, create unit
6. Respond to the request with the units settings.
