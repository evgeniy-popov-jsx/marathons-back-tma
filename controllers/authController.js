const User = require('../models/userModel');
const { validate, parse } = require('@telegram-apps/init-data-node');

exports.authUser = async (req, res) => {
  const [authType, authData = ''] = (req.header('authorization') || '').split(
    ' ',
  );

  if (authType !== 'tma') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (!authData) {
      return res.status(400).json({ message: 'No auth data provided' });
    }

    validate(authData, process.env.TELEGRAM_BOT_TOKEN, { expiresIn: 3600 });
    const initData = parse(authData);

    let user = await User.findOne({ telegramId: initData.user.id });

    if (!user) {
      user = await User.create({
        telegramId: initData.user.id,
        initData
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
    
  } catch (error) {
    console.error('Error during auth:', error);
    res.status(401).json({ error: 'Invalid data' });
  }
};
