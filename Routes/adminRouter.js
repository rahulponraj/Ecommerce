const { Router } = require('express');
const router = Router();
const userController=require('../controllers/userController');
const productController=require('../controllers/productController');
const categoryController=require('../controllers/categoryController');
const adminController=require('../controllers/adminController');
const adminAuthMiddleware=require('../controllers/adminAuth')


router.get('/',adminController.loadAdminLogin);

router.post('/login',adminController.verifyLogin);

router.get('/logout',adminController.adminlogout)

router.get('/verifyOtp',adminController.loadVerifyOtp)

router.post('/verifyOtp',adminController.adminverifyOTP)

router.get('/dashboard',adminAuthMiddleware.adminLoggedOn,adminController.loadDashboard)

router.get('/categories',adminAuthMiddleware.adminLoggedOn,categoryController.loadListCategory)

router.get('/addCategory',adminAuthMiddleware.adminLoggedOn,categoryController.loadAddCategory);
 
router.post('/addCategory',categoryController.addCategory);

router.get('/editCategory',adminAuthMiddleware.adminLoggedOn,categoryController.loadEditCategory);

router.post('/editCategory',categoryController.updateCategory);

router.get('/deleteCategory',categoryController.deleteCategory);

router.get('/listProducts',adminAuthMiddleware.adminLoggedOn,productController.loadProductList);

router.get('/editProduct',adminAuthMiddleware.adminLoggedOn,productController.loadEditproduct);
 
router.post('/editProduct',productController.uploadMultiple,productController.updateProduct);

router.post('/deleteImage',productController.deleteImage);

router.get('/deleteProduct',productController.deleteProduct);

router.get('/addProduct',adminAuthMiddleware.adminLoggedOn,productController.loadAddProduct)

router.post('/addProduct',productController.uploadMultiple,productController.saveProduct)

router.get('/listUsers',adminAuthMiddleware.adminLoggedOn,userController.loadUserlist)

router.post('/editUser',userController.loadEditUser)

router.post('/updateUser',userController.updateUser)

router.get('/addUser',adminAuthMiddleware.adminLoggedOn,userController.loadAdduser)

router.post('/addUser',userController.saveUser)

router.post('/userStatus',userController.updateStatus)

router.get('/orders',userController.loadOrdersList);

router.get('/vieworders',userController.loadOrdersDateList);

router.post('/orders/editOrderStatus', userController.editOrderStatus);

router.get('/orders/orderView',adminAuthMiddleware.adminLoggedOn,userController.loadorderView)

router.get('/coupons',adminAuthMiddleware.adminLoggedOn, adminController.loadAdminCouponlist);

router.post('/addCoupon', adminController.addCoupon);

router.get('/blockCoupon', adminController.blockCoupon);

router.get('/unblockCoupon', adminController.unblockCoupon);

router.get('/deleteCoupon', adminController.deleteCoupon);

router.get('/banners',adminAuthMiddleware.adminLoggedOn, adminController.loadBanners);

router.post('/banners', adminController.uploadMultiple, adminController.saveBanner);

router.get('/deleteBanner', adminController.deleteBanner);

router.get('/activateBanner', adminController.activateBanner);

router.get('/hideBanner', adminController.hideBanner);

router.post('/salesReport',adminController.loadSalesReport);

router.post('/monthlySales',adminController.loadmonthlySales);

router.post('/chartType',adminController.loadDifferentCharts);

router.get('/listStock',productController.loadStockDetails);

router.get('/downloadpdfreport',userController.loadOrderPdf);

router.get('/downloadexcelreport',userController.loadOrderExcel);


module.exports=router


