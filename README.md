**This has not been tested. Just a starting point.**
**Waiting for the electronics to be done to make a database to test with.** 

This will be the server that listens for the communication with the units. 
Will likely be at packets.blumemicrofarms.com

General overview is the units will make a GET request to this unit and this server will respond with the units current settings.
We respond with the settings to let the unit know we recieved it as well as tell the unit to check if the unit's settings have been updated. 
