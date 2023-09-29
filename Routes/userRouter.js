const { Router } = require('express');
const router = Router();
const userController=require('../controllers/userController');
const productController=require('../controllers/productController')
const autMiddleware=require('../controllers/authMiddleware')

router.get('/homepage',userController.loadHomepage)

router.get('/signup',userController.loadUserSignup)

router.post('/signup',userController.tempstore);

router.get('/sendotp',userController.loadSendOtp);

router.post('/sendotp',userController.sendOTP);

router.get('/verifyotp',userController.loadVerifyOtp);

router.post('/verifyotp',userController.verifyOTP)

router.get('/login',userController.loadLoginPage)

router.post('/login',userController.verifyLogin)

router.get('/logout',userController.userLogout)

router.get('/profile',autMiddleware.isLoggedIn,userController.userProfileDetails);

router.post('/profile/updateInfo',userController.saveUserProfile);

router.post('/profile/changeEmail',userController.changeEmail);

router.post('/profile/changePwd',userController.changePwd);

router.post('/profile/forgotPwd/sendOtp',userController.forgotPwdSendOtp);

router.post('/profile/forgotPwd/verifyOtp',userController.verifyPwdOtp);

router.post('/profile/forgotPwd/updatePwd',userController.updateForgotPwd);

router.post('/profile/changeNum/newNumSendOtp',userController.newNumSendOtp);

router.post('/profile/changeNum/verifyChangePhoneOtp',userController.verifyChangePhoneOtp);

router.get('/profileEditAddress',autMiddleware.isLoggedIn,userController.userProfileEditAddress);

router.post('/profileEditAddress',autMiddleware.isLoggedIn,userController.userProfileAddressDetails);

router.get('/profileAddressList',autMiddleware.isLoggedIn,userController.userProfileAddressList);

router.post('/profileAddressList/addAddressFromCheckout',autMiddleware.isLoggedIn,userController.addAddressFromCheckout);

router.post('/profileAddressList/updateAddress',userController.updateAddress);

router.post('/home/cart/updateAddress',userController.updateAddressInCheckout);

router.post('/profileAddressList/deleteAddress',userController.deleteAddress);

router.get('/profileOrders',autMiddleware.isLoggedIn,userController.currentOrders);

router.get('/profileOrderDetails',autMiddleware.isLoggedIn,userController.loadOrderDetails);

router.post('/profileOrderDetails/cancelOrder',autMiddleware.isLoggedIn,userController.cancelOrder)

router.post('/profileOrderDetails/cancelCodOrder',autMiddleware.isLoggedIn,userController.cancelCodOrder)

router.post('/profileOrderDetails/cancelWalletOrder',autMiddleware.isLoggedIn,userController.cancelWalletOrder)

router.post('/profileOrderDetails/changeOrderStatus',userController.changeOrderStatus);

router.get('/order/downloadInvoice',autMiddleware.isLoggedIn,userController.downloadInvoice);

router.get('/wallet',autMiddleware.isLoggedIn,userController.userWalletDetails);






module.exports=router;