const express = require('express');
const connectMongoDB = require('./config/mongodb');
require('dotenv').config();
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();


app.use(express.json());


connectMongoDB();


app.use('/api/menu', require('./routes/menu')); //
app.use('/api/orders', require('./routes/orders'));


app.get('/', (req, res) => {
  res.send('Food Delivery Hybrid API is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});