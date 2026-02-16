let express = require('express');
let router = express.Router();
let controller = require('../Controllers/AiController');

router.post('/ask', controller.askAi);

module.exports = router;