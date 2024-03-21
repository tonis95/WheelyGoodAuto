//createDB.js
//creates the order db and initializes the inventory

var sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'blitz.cs.niu.edu',
    user: 'student',
    password: 'student',
    database: "csci467"       
  });
   
  // open the MySQL connection
  connection.connect(error => {
      if (error){
          console.log("A error has been occurred "
              + "while connecting to database.");        
          throw error;
      }
  });


var db = new sqlite3.Database('./order.db');
createTables(db);
intializeInventory(db);

//creates all of the tables for the order database will need to be extended later
function createTables(newdb) {
    newdb.serialize(() => {
        newdb.run('CREATE TABLE CustomerOrder (orderId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, customerId VARCHAR(30) NOT NULL, orderDate VARCHAR(30) NOT NULL,' +
                                               'shipAddr VARCHAR(30) NOT NULL, email VARCHAR(30) NOT NULL, creditCardNumber VARCHAR(16) NOT NULL,' +
                                               'creditCardExpDate VARCHAR(30) NOT NULL, status VARCHAR(20) NOT NULL, shippingAmount DECIMAL(12,2) NOT NULL,' +
                                               'totalAmount DECIMAL(12,2) NOT NULL)');

        newdb.run('CREATE TABLE OrderItem (orderId INTEGER, partNumber INTEGER, quantity INTEGER, PRIMARY KEY (orderId, partNumber), FOREIGN KEY (orderId) REFERENCES CustomerOrder(orderId))');

        newdb.run('CREATE TABLE WeightBracket (lowerWeight INTEGER PRIMARY KEY, upperWeight INTEGER, amount INTEGER)');
        newdb.run('CREATE TABLE Inventory (partNumber INTEGER PRIMARY KEY, itemName VARCHAR(255) NOT NULL, quantity INTEGER NOT NULL)');
});

}

function intializeInventory(newdb) {
    let query = 'SELECT description, number FROM parts';

    const sql = 'INSERT INTO Inventory (partNumber, itemName, quantity)' +
        'VALUES (?, ?, ?)';
    var name, partNum;

    connection.query(query, function (err, data) {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            name = data[i].description;
            partNum = data[i].number;

            newdb.run(sql, [partNum, name, 15], function (err) {
                if (err) {
                    return console.log(err.message);
                }
            })
        }

        // Close SQLite connection
        newdb.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('SQLite connection closed.');
            }
        });

        // Close MySQL connection
        connection.end();
    });
}