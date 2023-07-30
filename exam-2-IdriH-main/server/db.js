'use strict';

/** DB access module **/

const sqlite = require('sqlite3');
const path = require('path');//its going to run in linux so who knows
let dbPath = path.join(__dirname, 'airplane_seats.db');
// open the database
const db = new sqlite.Database(dbPath, (err) => {
  if (err) throw err;
});

module.exports = db;
