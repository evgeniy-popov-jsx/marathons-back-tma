const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7461152904:AAHfUVU8KZXX6GMgeqPacgljTtOoHiWSKX0';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

/**
 * Отправляет уведомление о новых днях в Telegram
 * @param {string} telegramId - ID пользователя в Telegram
 */
const sendTelegramNotification = async (telegramId, customText) => {
  if (!telegramId) return;

  try {
    const message = customText;
    
    await axios.post(TELEGRAM_API_URL, {
      chat_id: telegramId,
      text: message,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error(`Ошибка отправки уведомления пользователю ${telegramId}:`, 
      error.response?.data || error.message);
    throw error;
  }
};

/**
 * Отправляет видео с Rutube как ссылку
 * @param {string} chatId - ID чата в Telegram
 * @param {string} rutubeUrl - Ссылка на видео Rutube (например: 'https://rutube.ru/video/123/')
 * @param {string} [caption] - Подпись к видео
 */
const sendRutubeVideo = async (chatId, rutubeUrl, caption = '') => {
  try {
    // Проверяем, что ссылка ведет на Rutube
    if (!isValidRutubeUrl(rutubeUrl)) {
      throw new Error('Некорректная ссылка Rutube. Ожидается формат: https://rutube.ru/video/...');
    }

    // Вариант 1: Отправка как текстовой ссылки
    const messageText = `${caption || '🎬 Видео'}\n${rutubeUrl}`;
    const sentMessage = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: messageText,
        disable_web_page_preview: false // Пробуем показать превью
      }
    );

    // Вариант 2: Отправка кнопкой (если превью не работает)
    if (sentMessage.data?.ok === false) {
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: caption || 'Смотрите видео на Rutube',
          reply_markup: {
            inline_keyboard: [[{
              text: '📺 Открыть видео',
              url: rutubeUrl
            }]]
          }
        }
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки Rutube видео:', error.message);
    throw new Error('Не удалось отправить ссылку на Rutube');
  }
};

// Проверка корректности ссылки Rutube
const isValidRutubeUrl = (url) => {
  const rutubeDomains = [
    'rutube.ru',
    'rutu.be' // Возможные сокращенные домены
  ];
  try {
    const parsedUrl = new URL(url);
    return rutubeDomains.some(domain => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
};

/**
 * Отправляет уведомления нескольким пользователям
 * @param {Array<{telegramId: string}>} notifications - Массив с ID пользователей
 */
const sendBulkTelegramNotifications = async (notifications) => {
  try {
    const results = await Promise.allSettled(
      notifications.map(({ telegramId }) => 
        sendTelegramNotification(telegramId, `🎉 Вам стали доступны новые дни в марафоне!`)
    ));

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    return { successCount, failedCount };
    
  } catch (error) {
    console.error('Ошибка массовой отправки уведомлений:', error);
    throw error;
  }
};

module.exports = {
  sendTelegramNotification,
  sendBulkTelegramNotifications,
  sendRutubeVideo
};