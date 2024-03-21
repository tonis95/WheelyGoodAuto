//app.js - backend
//holds all post and get functions for backend
//connects to legacy database as well as the order database

//include npm packages
const dir = '${__dirname}/';
const path = require('path');
const express = require('express')
var fs = require('fs');
const app = express()
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');
const util = require('util');
const cors = require('cors');
var nodemailer = require('nodemailer');

var port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let cart = [];
var shippingtotal;

// Create a connection to the database
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

//grab all part info
module.exports = {
    getAll: async result => {
        connection.query("SELECT * FROM parts",  function (err, data) {
        if (err) throw err;
        result(data);
        });
    }
}

const query = util.promisify(connection.query).bind(connection);

//Select info from all parts
const fetchall = async () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM parts', function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

app.get('/api/data', (req, res) => {
    console.log('This prints to the console running in the server when the button is clicked');
});

//This method takes all of the orders from the customers order table in the order db and returns them in an array
app.get('/api/adminOC', async (req, res) => {
   
    try {
        const order = await getOrderData();

        res.send(order);
    } catch(error) {
        console.error('Error finding order data', error)
    }
});

//collect information on all orders
const getOrderData = () => {
    return new Promise((resolve, reject) => {
        const order = [];

        let sql = `SELECT * FROM CustomerOrder`;

        //query order db for all orders
        orderdb.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                for (var i = 0; i < rows.length; i++) {
                    //push order info into array
                    order.push({
                        orderId: rows[i].orderId,
                        customerId: rows[i].customerId,
                        total: rows[i].totalAmount,
                        date: rows[i].orderDate,
                        address: rows[i].shipAddr,
                        email: rows[i].email,
                        ccnum: rows[i].creditCardNumber,
                        ccexp: rows[i].creditCardExpDate,
                        status: rows[i].status,
                        shipam: rows[i].shippingAmount,
                    });
                }
                resolve(order);
            }
        });
    });
};

//update backend cart
app.post('/api/cart', async (req, res) => {
    const cartItems = req.body;

    cart = [];
    shippingtotal = 0;
    weight = 0;
    for (var i = 0; i < cartItems.length; i++) {
        cart.push(cartItems[i]);
        weight += cartItems[i].weight;
    }

    try {
        shippingtotal = await getshipping(weight);
       } catch (error) {
            console.error(error);
       }

    res.json({ message: 'Data received successfully'});
});

//get all order items for an order
app.post('/api/OrderItems', async (req, res) => {
    var id = req.body;
    items = []

    try {
        items = await getitemdata(id);
        res.send(items);
    } catch (error) {
        console.error(error)
    }
});

//pulls all order items given an order id
const getitemdata = (id) => {
    return new Promise((resolve, reject) => {
        const item = [];
        idnum = id.orderId
        console.log(idnum);
        let sql = 'SELECT * FROM OrderItem WHERE orderId = ' + idnum.toString();
        //query database for order items
        orderdb.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                for (var i = 0; i < rows.length; i++) {
                    item.push({
                        orderId: rows[i].orderId,
                        num: rows[i].partNumber,
                        quantity: rows[i].quantity,
                    });
                }
                resolve(item);
            }
        });
    });
};

//update cart with cartitems
app.post('/api/quantity', (req, res) => {
    const cartItems = req.body;

    cart = []
    for (var i = 0; i < cartItems.length; i++) {
        cart.push(cartItems[i]);
    }
    res.json({ message: 'Data received successfully'});
});

//send in backend cart
app.get('/api/obtainCart', (req, res) => {
    const response = {cart, shippingtotal};
    res.json(response);
});

//collect all information from legacy db
app.get('/api/collect', async (req, res) => {
    const partArray = [];
    try {
        const data = await fetchall();
        
        for (let i = 0; i < data.length; i++) {
            
            const total = await onHand(data[i].number);

            partArray.push({
                name: data[i].description,
                img: data[i].pictureURL,
                price: data[i].price,
                partNum: data[i].number,
                weight: data[i].weight,
                amount: total,
            });

        }

        res.send(partArray);

    } catch (error) {
        throw error;
    }
});

//add new weight bracket
app.post('/api/handleShipping', async (req, res) => {
    try{
        const value = (req.body).amount;
        const lower = (req.body).lower;
        const upper = (req.body).upper;
        console.log(value, lower, upper);

        addWeightBracket(lower, upper, value);           //add the new bracket into the order database
    } catch (error) {
        console.error(error)
    }
}),

//add products to inventory from receiving desk
app.post('/api/handleInventory', async (req, res) => {
    try{
        const descriptor= (req.body).descriptor;
        const quantity = (req.body).quantity;

        addProducts(descriptor, quantity);
    } catch (error) {
        console.error(error)
    }
}),

//complete order and update order status
app.post('/api/finishOrder', async (req, res) => {
    try{
        const id = (req.body).orderId;

        changeOrderStatus(id);
    } catch (error) {
        console.error(error)
    }
}),
        
//proccess a completed order
app.post('/api/processOrder', async (req, res) => {
    try{
        
       const values = req.body;

       creditCardNumber = values[0];
       customerId = values[1];
       email = values[2];
       shipAddr = values[3];
       month = values[4];
       year = values[5];

       total = 0;

       weight = 0;

       //calculate the quantity and weight
       for (var i = 0; i < cart.length; i++) {
            total += (cart[i].price * cart[i].quantity);
            weight += (cart[i].weight * cart[i].quantity);
       }
       total = total.toFixed(2);
       
       let numstr = creditCardNumber.toString();
       let CCLength = numstr.length;

        //Checks to see if credit card number is the min 16
        if(CCLength !== 16){
            return res.send('INVALID CREDIT CARD NUMBER');
            //kill = true;
        }

        var currentDate = month;
        currentDate += `/`;
        currentDate += year;

        console.log(shipAddr, email, numstr, customerId, currentDate, total, shippingtotal);
        addOrderNum(customerId, currentDate, shipAddr, email, numstr, currentDate, total, shippingtotal, cart);

        //The JS version of the Php code provided with some changends
        const url = 'http://blitz.cs.niu.edu/CreditCard/';
 
        const data = {
            vendor: 'VE001-99',
            trans: '907-987654321-296',
            cc: numstr,
            name: customerId,
            exp: currentDate,
            amount: total
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        };

        fetch(url, options)
        .then(response => {
            if(!response.ok) {
                throw new Error (`ERROR: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('success', result);
            emailToUser(email, "Order Receieved", "This is a confirmation email letting you know that we have received your order, we will send another email when your order has been shipped, thank you for shopping with us!");

        })
        .catch(error => {
            console.error('Error:', error);
        });
        
        // Handle the response or futher processing needed
        res.send('Order processed sucessfully');

    } catch (error){
        // Logs and sends a generic error message for server errors
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`)
  })

//connect to order database
var dbpath = './order.db';
var dbExists = fs.existsSync(dbpath);
if (!dbExists) {
  fs.openSync(dbpath, 'w');
}
  
//connect to order db
var orderdb = new sqlite3.Database(dbpath, sqlite3.OPEN_READWRITE,  (err) => {
   if (err) {
       return console.error(err.message);
   }
  
    console.log("successfuly connected to order database");
    });

//send email to user
function emailToUser(email, header, body) {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        host: 'smtp.gmail.com',
        auth: {
            user: 'wheelygoodparts@gmail.com',
            pass: 'ylpt ihoj jhoi pist'
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mail = {
        from: 'wheelygoodparts@gmail.com',
        to: email,
        subject: header,
        text: body,

    };

    //send message
    transport.sendMail(mail, function (err, info) {
        if(err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    })
}

//for debugging use only
function printweights() {
    let sql = 'SELECT * FROM WeightBracket';

    orderdb.all(sql, [], (err, data) => {
        if (err) {
          throw err;
        }console.log(data);
       
      });
}

//calculate the amount on hand
function onHand(id) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT quantity FROM Inventory WHERE partNumber = ?';

        orderdb.all(sql, [id], (err, data) => {
            if (err) {
                reject(err);
            } else {
                const quantity = data[0].quantity;
                resolve(quantity);
            }
        });
    });
}
//change the status of an order
function changeOrderStatus(id) {
    const sql = 'UPDATE CustomerOrder SET status = ? WHERE orderId = ?';
    const query = 'SELECT email FROM CustomerOrder WHERE orderId = ?';
    orderdb.run(sql, ["shipped", id], function(err) {     //insert part id
        if (err) {
            return console.log(err.message);
        }
        //complete order and send email
        orderdb.all(query, [id], (err, data) => {
            if (err) {
              throw err;
            }console.log(data);
            let userEmail = data[0].email;
            emailToUser(userEmail, "Order has been shipped", "Dear customer, you are receiving this message notifying you that your order has been shipped to your address, thank you for shopping with Wheely Good Auto Parts! - Management Team");
          });
    }) 
}

//add a weight bracket
function addWeightBracket(lower, upper, amount) {
    const sql = 'INSERT INTO WeightBracket (lowerWeight, upperWeight, amount)' +
                'VALUES (?, ?, ?)';

    orderdb.run(sql, [lower, upper, amount], function(err) {
        if(err) {
            return console.log(err.message)
        }
    });

    printweights();
}

//update the inventory
function addProducts(descriptor, q) {
    const sql = 'UPDATE Inventory SET quantity = ? WHERE partNumber = ?';
    let quantity = parseInt(q);
    //if partnum
    if(!isNaN(parseFloat(descriptor)) && isFinite(descriptor)) {

        let query = 'SELECT itemName, quantity FROM Inventory WHERE partNumber = ' + descriptor.toString();

        //update quantity
        orderdb.all(query, [], (err, data) => {
            if (err) {
              throw err;
            }console.log(data);
            let currentQuantity = +data[0].quantity;
            let newQuantity = currentQuantity + quantity;
            console.log (typeof currentQuantity);
            console.log(typeof quantity);

            orderdb.run(sql, [newQuantity, descriptor], function(err) {     //insert part id
                if (err) {
                    return console.log(err.message);
                }
            }) 

            printInventory();
           
          });
    }
    //or description
    else {
            let query = "SELECT partNumber, quantity FROM Inventory WHERE itemName = '" + descriptor + "'";
            //update quantity
            orderdb.all(query, [], (err, data) => {
                if (err) {
                  throw err;
                }console.log(data);
                let number = data[0].partNumber;
                var newQuantity = data[0].quantity + quantity;
    
                orderdb.run(sql, [newQuantity, number], function(err) {     //insert part id
                    if (err) {
                        return console.log(err.message);
                    }
                }) 

                printInventory();
               
              });
    }

}
//print out the inventory
function printInventory() {
    let sql = 'SELECT * FROM Inventory';

    orderdb.all(sql, [], (err, data) => {
        if (err) {
          throw err;
        }console.log(data);
       
      });
}

//get the shipping and handeling
function getshipping(weight) {
    let sql = 'SELECT * FROM WeightBracket';

    return new Promise((resolve, reject) => {
        orderdb.all(sql, [], (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            //find the weight bracket that matches the weight of order
            for (var i = 0; i < data.length; i++) {
                if (weight >= data[i].lowerWeight && weight <= data[i].upperWeight) {
                    resolve(data[i].amount);
                    return;
                }
            }

            resolve(0);
        });
    });
}

//add the order num into the customer order table
function addOrderNum(customerId, currentDate, shipAddr, email, numstr, currentDate, total, weight, cart){
    
    const insertOrderPartSQL = 'INSERT INTO CustomerOrder (customerId, orderDate, shipAddr, email, creditCardNumber, creditCardExpDate, status, shippingAmount, totalAmount)' +
        'VALUES (?, ?, ?, ?, ?, ?, "authorized", ?, ?)';

    const sql = 'UPDATE Inventory SET quantity = ? WHERE partNumber = ?';

    var currentDate = new Date();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();

    var inputDate = month.toString() + "/" + day.toString();

       //insert the order information into the customerorder table
       orderdb.run(insertOrderPartSQL, [customerId, inputDate, shipAddr, email, numstr, currentDate, weight, total], function(err) {     //insert part id
        if (err) {
          return console.log(err.message);
        } const orderId = this.lastID;

        const insertOrderNumSQL = 'INSERT INTO OrderItem (orderId, partNumber, quantity) VALUES (?, ?, ?)';
        for(var i = 0; i < cart.length; i++){
            orderdb.run(insertOrderNumSQL, [orderId, cart[i].partNum, cart[i].quantity], function(err) {     //insert part id
                if (err) {
                  return console.log(err.message);
                }
            });
        }   
    });   

        removeFromInventory(cart, sql)
}

//remove item from inventory on order
async function removeFromInventory(cart, sql) {
    const query = "SELECT quantity FROM Inventory WHERE partNumber = ?";

    for (let i = 0; i < cart.length; i++) {
        try {
            const data = await getOrderQuantity(cart[i].partNum, query);
            console.log(data);

            const newQuantity = data[0].quantity - cart[i].quantity;

            await updateInventory(sql, newQuantity, cart[i].partNum);
        } catch (err) {
            console.error(err);
        }
    }
}

//get the quantity of an order
function getOrderQuantity(partNum, query) {
    return new Promise((resolve, reject) => {
        orderdb.all(query, [partNum], (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

//update the inventory in orderdb
function updateInventory(sql, newQuantity, partNum) {
    return new Promise((resolve, reject) => {
        orderdb.run(sql, [newQuantity, partNum], (err) => {
            if (err) {
                reject(err.message);
            } else {
                resolve();
            }
        });
    });
}