const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routes/authRouter');
const unlockDayRouter = require('./routes/unlockDayRouter');
const paymentRouter = require('./routes/paymentRouter');

const app = express();

const corsOptions = {
  origin: [
    'https://irina-grechushenko-web-marathons-front-tma-1bc2.twc1.net',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.set('trust proxy', true);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/update-day', unlockDayRouter);
app.use('/api/v1/payment', paymentRouter);


module.exports = app;
