const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

// Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
	console.log("DB connected");
})
mongoose.connection.on('error', err => {
	console.log(`DB connect error: ${err}`);
})

// bring in routes
const postRoute = require('./routes/post');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

// API Documentation
app.get('/', (req, res) => {
  fs.readFile('./docs/apiDocs.json', (err, data) => {
    if (err) return res.status(400).json( {error: err} );;
    res.json(JSON.parse(data));
  })
})


// Middleware
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());
app.use('/', postRoute);
app.use('/', authRoute);
app.use('/users', userRoute);

app.use(function (err, req, res, next) {
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).json( {error: "Unauthorized"} );
  }
});


// Listen port
app.listen(port, () => {
	console.log(`Node API listen on port ${port}`);
})