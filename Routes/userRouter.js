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

router.get('/userProfile',autMiddleware.isLoggedIn,userController.userProfileDetails);

router.post('/userProfile/updateInfo',userController.saveUserProfile);

router.post('/userProfile/changeEmail',userController.changeEmail);

router.post('/userProfile/changePwd',userController.changePwd);

router.post('/userProfile/forgotPwd/sendOtp',userController.forgotPwdSendOtp);

router.post('/userProfile/forgotPwd/verifyOtp',userController.verifyPwdOtp);

router.post('/userProfile/forgotPwd/updatePwd',userController.updateForgotPwd);

router.post('/userProfile/changeNum/newNumSendOtp',userController.newNumSendOtp);

router.post('/userProfile/changeNum/verifyChangePhoneOtp',userController.verifyChangePhoneOtp);

router.get('/userProfileEditAddress',autMiddleware.isLoggedIn,userController.userProfileEditAddress);

router.post('/userProfileEditAddress',autMiddleware.isLoggedIn,userController.userProfileAddressDetails);

router.get('/userProfileAddressList',autMiddleware.isLoggedIn,userController.userProfileAddressList);

router.post('/userProfileAddressList/addAddressFromCheckout',autMiddleware.isLoggedIn,userController.addAddressFromCheckout);

router.post('/userProfileAddressList/updateAddress',userController.updateAddress);

router.post('/home/cart/updateAddress',userController.updateAddressInCheckout);

router.post('/userProfileAddressList/deleteAddress',userController.deleteAddress);

router.get('/userProfileOrders',autMiddleware.isLoggedIn,userController.currentOrders);

router.get('/userProfileOrderDetails',autMiddleware.isLoggedIn,userController.loadOrderDetails);

router.post('/userProfileOrderDetails/cancelOrder',autMiddleware.isLoggedIn,userController.cancelOrder)

router.post('/userProfileOrderDetails/cancelCodOrder',autMiddleware.isLoggedIn,userController.cancelCodOrder)

router.post('/userProfileOrderDetails/cancelWalletOrder',autMiddleware.isLoggedIn,userController.cancelWalletOrder)

router.post('/userProfileOrderDetails/changeOrderStatus',userController.changeOrderStatus);

router.get('/order/downloadInvoice',autMiddleware.isLoggedIn,userController.downloadInvoice);

router.get('/userWallet',autMiddleware.isLoggedIn,userController.userWalletDetails);






module.exports=router;