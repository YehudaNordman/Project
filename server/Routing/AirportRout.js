let express = require('express');
let router = express.Router();
let controller = require('../Controllers/AirportController');

// פונקציות חיצוניות למשיכת אטרקציות ומסעדות
router.get('/fetchAttractions', controller.fetchAttractions);
router.get('/fetchRestaurants', controller.fetchRestaurants)

// GET /airports/top10
router.get('/top10', controller.getTop10);
router.get('/getNameCityCountry', controller.getNameCityCountry);
router.get('/country/:country', controller.getAirportsByCountry);
router.get('/:name', controller.getLocationByName);
router.get('/locationById/:id', controller.getLocationById);
module.exports = router;