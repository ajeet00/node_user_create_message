const express = require('express');
const bodyParser = require('body-parser');
const httpStatus = require('http-status');
const responseAPI = require('./helpers/apiResponse');
const helmet = require('helmet');
const { errorConverter, errorHandler } = require('./middleware/error');
const ApiError = require('./helpers/apiError');
const http = require('http');
require('dotenv').config({ path: './../.env' });
const app = express();
const db = require('./models');
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(bodyParser.json());
 
app.use(bodyParser.urlencoded({
    extended: true
}));

// import routes
const authRoute = require('./routes/v1/authRoute');
app.use(authRoute);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Requested API Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

app.set('port', process.env.PORT);
var server = http.createServer(app);
db.sequelize.sync().then((req) => {
   server.listen(process.env.PORT);
});