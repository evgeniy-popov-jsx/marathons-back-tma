const User = require('../models/userModel');
const axios = require('axios');
const yooKassa = require('./yookassa');
const crypto = require('crypto');

exports.createPayment = async (req, res) => {
  const { telegramId  } = req.body;

  if (!telegramId) {
    return res.status(400).json({ message: 'telegramId is required' });
  }

  try {
    const payment = await yooKassa.createPayment({
      amount: {
        value: '999.00',
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: process.env.REDIRECT_URL,
      },
      capture: true,
      description: 'Оплата подписки',
      receipt: {
        items: [
          {
            description: 'Оплата подписки',
            quantity: 1,
            amount: {
              value: '999.00',
              currency: 'RUB'
            },
            vat_code: 1
          }
        ]
      },
      metadata: {
        telegramId,
        orderId: crypto.randomUUID(),
      },
    });

    res.json({ confirmationUrl: payment.confirmation.confirmation_url });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ message: 'Ошибка при создании платежа' });
  }
};

exports.handleWebhook = async (req, res) => {
  const event = req.body;

  if (event.event === 'payment.succeeded') {
    try {
      const paymentId = event.object.id;

      const response = await axios.get(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
        auth: {
          username: process.env.YOOKASSA_SHOP_ID,
          password: process.env.YOOKASSA_SECRET_KEY,
        }
      });

      const payment = response.data;

      if (payment.status !== 'succeeded') {
        console.warn(`Payment status is not succeeded: ${payment.status}`);
        return res.status(400).send('Payment not succeeded');
      }
      const telegramId = payment.metadata?.telegramId;

      if (!telegramId) {
        console.warn('telegramId missing in payment metadata');
        return res.status(400).send('telegramId missing');
      }

      const updatedUser = await User.findOneAndUpdate(
        { telegramId },
        { 
          $set: {
            'badGirl.introductoryDay': 'open',
            'badGirl.day1': 'pending',
            'badGirl.day2': 'pending',
            'badGirl.day3': 'pending',
            'badGirl.instructions': 'pending',
            'badGirl.day4': 'pending',
            'badGirl.tutorial': 'pending',
            'badGirl.day5': 'pending',
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('Error handling webhook:', error);
      return res.status(500).send();
    }
  }
  return res.status(200).send('Event ignored');
};