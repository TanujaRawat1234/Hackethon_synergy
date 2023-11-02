/* eslint-disable no-undef */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const route = require('./routes');
const helmet = require('helmet');
const httpLogger = require('./middleware/httplogger');
const logger = require('./utills/logger');
const ejs = require('ejs');
const cors = require('cors');
const moment = require('moment');
const fs = require('fs');
const app = express();
const cluster = require('cluster');
const http    = require('http');
const numCPUs = require('os').cpus().length;
const upload = require('./utills/uploadImage');
const { logResponseBody } = require('./utills/helper');


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

app.use(cors());
app.use(helmet({contentSecurityPolicy :false}));
app.use(httpLogger);

app.use(function (req, res, next) {
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  const allowedOrigins = ['http://3.22.54.143:3000','http://localhost:4200'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.use(logResponseBody);

app.use(route);


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));


app.get('/error-log', (req, res) => {
  const data = fs.readFileSync('logs/all-logs.log', 'utf8');
  return res.send(data.toString());
});

// app.use(function (err, req, res) {
//   logger.info(`default error Handler ${err.message}`);
//   res.status(400).json({ 'statusCode': 400, 'message': 'Something broke!', error: err.message });
// });

app.get('/get-logs', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'logs/all-logs.log'), 'utf8');
    return res.send(data.toString());
  }
  catch (e) {
    console.log(e);
    res.json(e);

  }
  
});

app.delete('/delete-logs', (req, res) => {
  try {
    const data = fs.truncateSync(path.join(__dirname, 'logs/all-logs.log'));
    return res.send('All log deleted');
  }
  catch (e) {
    res.json(e);

  }
});

app.all('/*', function (req, res) {
  res.status(404).send({statusCode:404,message:'No route found'});
});

app.get('/demo',function(req,res) {
  res.render('update-password');
});

// app.server = http.createServer(app);
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);// Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
//   // Workers can share any TCP connection
//   app.listen(process.env.PORT, () => {
//     const message = `Worker : ${process.pid}`;
//     console.log(message);
//   });
//   console.log(`Worker ${process.pid} started`);
// }

app.listen(process.env.PORT, () => {
  logger.info(`Server listening on port ${process.env.PORT}`);
});

