const User = require('../models/userModel');
const { sendTelegramNotification, sendRutubeVideo } = require('../services/telegramNotifications');

exports.closeMarathonDay = async (req, res) => {
  try {
    const { userId, currentDayKey, nextDayKey } = req.body;

    if (!userId || !currentDayKey || !nextDayKey) {
      return res.status(400).json({
        status: 'fail',
        message: 'Необходимо указать userId, currentDayKey и nextDayKey'
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          [`badGirl.${currentDayKey}`]: 'finished',
          [`badGirl.${nextDayKey}`]: 'open',
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка сервера при обновлении дней марафона',
      error: err.message
    });
  }
};

exports.updateMarathonDay = async (req, res) => {
  try {
    const { userId, currentDayKey, nextDayKey } = req.body;

    if (!userId || !currentDayKey || !nextDayKey) {
      return res.status(400).json({
        status: 'fail',
        message: 'Необходимо указать userId, currentDayKey и nextDayKey'
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          [`badGirl.${currentDayKey}`]: 'finished',
          [`badGirl.${nextDayKey}`]: 'update',
          'badGirl.isUpdate': true
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка сервера при обновлении дней марафона',
      error: err.message
    });
  }
};

exports.finishMarathonDay = async (req, res) => {
  try {
    const { userId, finishDayKey } = req.body;

    if (!userId || !finishDayKey) {
      return res.status(400).json({
        status: 'fail',
        message: 'Необходимо указать userId и currentDay'
      });
    }

    // 1. Обновляем статус дня
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          [`badGirl.${finishDayKey}`]: 'finished',
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Пользователь не найден'
      });
    }

    if (updatedUser.telegramId) {
      try {
        const videoPath = 'https://rutube.ru/video/private/73c6eee4aeb381e7ec65893522151c20/?p=o8RfkzHI-NG_boyQBF71sQ';
        const congratMessage = 
        `
        🎉Поздравляю с завершением марафона!\n
✍️Буду благодарна, если напишите отзыв и поделитесь своими впечатлениями и результатами.\n
Ниже в эфире:
- почему так сложно изменить привычное поведение
- как выдерживать негативные реакции на свой отказ и выбор себя
- как справиться со страхом «быть не нужной»
- как укреплять внутреннюю опору, и свою ценность
- разбор ситуации отказа родителей детям
- рассказала о технике «разговор с сопротивлением» разобрав ее суть.
        `;
        await sendTelegramNotification(updatedUser.telegramId, congratMessage);
        await sendRutubeVideo(updatedUser.telegramId, videoPath);
        
      } catch (tgError) {
        console.error('Ошибка отправки сообщения в Telegram:', tgError);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      }
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка сервера при завершении дня марафона',
      error: err.message
    });
  }
};