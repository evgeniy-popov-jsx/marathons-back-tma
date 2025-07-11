const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('./cron/index.js');

dotenv.config({ path: './config.env' });

const DB =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_DATABASE
    : process.env.DATABASE_LOCAL;

mongoose
  .connect(DB)
  .then(() => console.log('Успешно подключена'))
  .catch((err) => console.error('Ошибка подключения:', err));

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Приложение запущено через порт ${port}...`);
});
