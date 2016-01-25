"use strict";

const http = require('http');
const PATH = "?unitId=1&temperature=70&light=0&water=0";

http.get(`http://localhost:3000${PATH}`, (res) => {
  // Continuously update stream with data
  let body = '';
  
  res.on('data', (d) => {
    body += d;
  });
  
  res.on('end', () => {
    console.log(body);
  });
  
}).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
});