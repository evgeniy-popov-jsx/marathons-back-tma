const cron = require('node-cron');
const User = require('../models/userModel');
const { sendBulkTelegramNotifications } = require('../services/telegramNotifications');

const processUsersWithUpdates = async () => {
  try {
    // 1. Находим пользователей для обновления
    const users = await User.aggregate([
      {
        $match: {
          $or: [
            { 'badGirl.introductoryDay': 'update' },
            { 'badGirl.day1': 'update' },
            { 'badGirl.day2': 'update' },
            { 'badGirl.day3': 'update' },
            { 'badGirl.instructions': 'update' },
            { 'badGirl.day4': 'update' },
            { 'badGirl.tutorial': 'update' },
            { 'badGirl.day5': 'update' },
          ],
        },
      },
      { $project: { _id: 1, badGirl: 1, telegramId: 1 } },
    ]);

    console.log(`Найдено ${users.length} пользователей для обработки`);

    // 2. Подготовка данных для обновления и уведомлений
    const bulkOps = [];
    const notifications = [];

    users.forEach((user) => {
      const updatePayload = { $set: { isUpdate: false } };
      const openedDays = [];

      Object.keys(user.badGirl).forEach((field) => {
        if (user.badGirl[field] === 'update') {
          updatePayload.$set[`badGirl.${field}`] = 'open';
          openedDays.push(field);
        }
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: updatePayload,
        },
      });

      // Добавляем уведомление, если есть telegramId и открытые дни
      if (user.telegramId && openedDays.length > 0) {
        notifications.push({
          telegramId: user.telegramId,
          openedDays,
        });
      }
    });

    // 3. Массовое обновление в MongoDB
    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps);
      console.log(`Обновлено пользователей: ${result.modifiedCount}`);
    } else {
      console.log('Нет пользователей для обновления');
    }

    // 4. Отправка уведомлений
    if (notifications.length > 0) {
      const { successCount, failedCount } = await sendBulkTelegramNotifications(notifications);
      console.log(`Уведомления отправлены: успешно ${successCount}, с ошибками ${failedCount}`);
    }
  } catch (error) {
    console.error('Ошибка в CRON задаче:', error);
  }
};

module.exports = processUsersWithUpdates;

cron.schedule('0 7 * * *', processUsersWithUpdates);

console.log('CRON задача для пользователей запущена');

module.exports = processUsersWithUpdates;