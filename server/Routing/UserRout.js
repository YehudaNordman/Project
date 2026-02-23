let express = require('express');
let router = express.Router();
let controller = require('../Controllers/UserController');
let isAdmin = require('../Middleware/isAdmin.js');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/reset-password', controller.resetPassword);

router.use(controller.auth);    // כל הפונקציות הבאות דורשות אימות חיבור

// Itinerary routes - MUST be above /:id to avoid "Cast to ObjectId" errors
router.get('/my-itineraries', controller.getUserItineraries);
router.post('/save-itinerary', controller.saveItinerary);
router.delete('/itinerary/:id', controller.deleteItinerary);

router.put('/update-me', controller.updateById); // מאפשר למשתמש לעדכן את עצמו ללא צורך באדמין

router.use(isAdmin);    // כל הפונקציות הבאות דורשות שהמשתמש יהיה אדמין
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.delete('/:id', controller.deleteById);
router.put('/:id', controller.updateById);

module.exports = router;