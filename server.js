const express = require('express');
const path = require('path');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const ErrorResponse = require('./utils/errorResponse');

// Load config var
dotenv.config({ path: './config/config.env' });

// Connect to mongo database
connectDB();

const app = express();

// Include resource routers
const auth = require('./routes/auth');


// Set logged for show http request
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set cookie parser
app.use(cookieParser());

// Set body parser
app.use(express.json());

// Set static path
app.use('/profile', express.static(path.join(__dirname, 'uploads')));

// Set secure for header
app.use(helmet());

// Enable cors
app.use(cors());

// Mount routers
app.use('/api/v1/auth', auth);

// Handle error 
app.use(errorHandler);


const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running ${process.env.NODE_ENV} mode on ${PORT} port`.yellow.bold);
});

// Handle unhandler promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log(`Error: ${reason.message}`.red.bold);
});