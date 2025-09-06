const path = require('path');
const fs = require('fs')
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by'); 
app.use(helmet());  

const cors = require('cors')
const serverless = require('serverless-http')
require('dotenv').config(); 

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors())

mongoose.connect(process.env.MONGO_URI, { dbName: 'mydb' })
  .then(() => {
    console.log('MongoDB Connection Successful');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

let Schema = mongoose.Schema;

let dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
let planetModel = mongoose.model('planets', dataSchema);



app.post('/planet', async (req, res) => {
  try {
    const id = Number(req.body.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const planetData = await planetModel.findOne({ id }).lean().exec();
    if (!planetData) {
      return res.status(404).json({ error: 'Planet not found' });
    }

    return res.json(planetData);
  } catch (err) {
    console.error('Error fetching planet:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/',   async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/api-docs', (req, res) => {
    fs.readFile('oas.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Error reading file');
      } else {
        res.json(JSON.parse(data));
      }
    });
  });
  
app.get('/os',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
})

app.get('/live',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
})

app.get('/ready',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
})

app.listen(3000, () => { console.log("Server successfully running on port - " +3000); })
module.exports = app;

//module.exports.handler = serverless(app)
