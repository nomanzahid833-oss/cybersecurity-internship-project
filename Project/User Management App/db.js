const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Noman123',
  database: 'cyberapp'
});

module.exports = connection;