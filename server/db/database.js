
var mysql = require('mysql');

exports.dbConnection = mysql.createConnection({
  user:'b1396610c21c11',
  password:'14436490',
  database: 'heroku_c344b5c199012eb'
});



// module.exports = (function() {
//   var knex = require('knex')({
//     client: 'mysql',
//     connection: {
//       host : '127.0.0.1',
//       user : 'root',
//       password : '',
//       database : 'tripmate_db'
//     }
//   })

//   knex.schema.createTableIfNotExists('users', function (table) {
//     table.increments();
//     table.string('username');
//   }).then(() => {
//     console.log('table created')
//   })
//   return knex;
// })();
// module.exports = knex;
