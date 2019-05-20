require('dotenv').config();
const express = require('express')
const helmet = require('helmet')
const app = express()
const cors = require('cors');
const port = 3000
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const ticketData = require('./ticketData')

app.use(helmet())

const whitelist = ['http://localhost:3000', 'https://wow.local', 'https://wondersofwildlife.org']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


const db = mongoose.connect(encodeURI(process.env.MONGO_URI), {
  useNewUrlParser: true,
  family: 4,
  connectTimeoutMS: 10000,
  auto_reconnect: true
}).catch(err => console.log(err));


app.get('/', cors(corsOptions ) ,function(req, res) {
  ticketData.Ticket.find({}).then( function(tickets, err) {
    if(err) {
      console.log(err)
    }
    res.json(tickets);
  });

});

app.listen()