const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const CATALOG_SERVICE_URL = 'http://localhost:5001';
const ORDERS_FILE = './orders.json';

// Helper function to record orders
function recordOrder(order) {
    const data = fs.readFileSync(ORDERS_FILE);
    const orders = JSON.parse(data);
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders));
}

// Purchase a book
app.post('/purchase/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    let x=req.body.qty
    if (x==undefined)
      x=1
    // Check stock
    const response = await axios.get(`${CATALOG_SERVICE_URL}/info/${itemNumber}`);
    const book = response.data;
    
    if (book && book.stock > 0) {

        const response = await axios.put(`${CATALOG_SERVICE_URL}/update-item/${itemNumber}`,{
            "stock": book.stock-x
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log("hello",book.stock)
          console.log(response.data);
        // Record order
        recordOrder({ id: itemNumber, title: book.name, date: new Date(),qty:x});
        res.json({ message: `Purchased  ${x} book${x>1?"s":""}: ${book.name}` });
    } else {
        res.status(400).send('Out of stock');
    }
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
