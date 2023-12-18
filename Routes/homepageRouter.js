const { Router } = require('express');
const router = Router();
const userController = require('../controllers/userController');


<<<<<<< HEAD
router.get('/', userController.loadHomepage)
=======
router.get('/',userController.loadHomepage)

>>>>>>> 9fd6b2897473ecb78725e29151a2fbf5252745c3



module.exports = router;