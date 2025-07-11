const unlockDayController = require('../controllers/unlockDayController');
const express = require('express');
const router = express.Router();

router.route('/open').post(unlockDayController.closeMarathonDay);
router.route('/update').post(unlockDayController.updateMarathonDay);
router.route('/finish').post(unlockDayController.finishMarathonDay);

module.exports = router;
