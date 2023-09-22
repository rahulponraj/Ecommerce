const { Router } = require('express');
const router = Router();
const userController=require('../controllers/userController');


router.get('/',userController.loadHomepage)

router.get('/warningclothing',userController.updatedHomePage)


module.exports=router;