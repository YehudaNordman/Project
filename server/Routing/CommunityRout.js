let express = require('express');
let router = express.Router();
let controller = require('../Controllers/CommunityController');
let userController = require('../Controllers/UserController');

// Public route to get all shared itineraries
router.get('/all', controller.getAllShared);

// Protected routes
router.use(userController.auth);
router.post('/share', controller.shareItinerary);
router.post('/like/:id', controller.likeItinerary);
router.post('/comment/:id', controller.addComment);

module.exports = router;
