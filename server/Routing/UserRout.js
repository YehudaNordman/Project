let express = require('express');
let router = express.Router();
let controller = require('../Controllers/UserController');
let isAdmin = require('../Middleware/isAdmin.js');

router.post('/register', controller.register);
router.post('/login', controller.login);

router.use(controller.auth);    // כל הפונקציות הבאות דורשות אימות חיבור
router.use(isAdmin);    // כל הפונקציות הבאות דורשות שהמשתמש יהיה אדמין
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.delete('/:id', controller.deleteById);
router.put('/:id', controller.updateById);
module.exports = router;