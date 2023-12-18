const Users = require('../models/UserModel');
const TempData = require('../models/tempModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const { default: mongoose } = require('mongoose');
const { default: orderId } = require('order-id');
const dotenv = require('dotenv');
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const multer = require('multer');
const customTemplate = require('../models/invoice')
const Banner = require('../models/bannerModel')

const easyinvoice = require('easyinvoice');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


const loadUserSignup = (req, res) => {

  res.render('signup')
}

const loadSendOtp = (req, res) => {

  res.render('sendotp');
}

const loadVerifyOtp = (req, res) => {
  res.render('verifyOtp');
}

const loadHomepage = async (req, res) => {
  if (req.session.isAuth) {
    isLogedIn = "true";
  } else {
    isLogedIn = "false";
  }
  try {

    const women1 = await Product.find({ For: "Women" }).limit(4)
    const women2 = await Product.find({ For: "Women" }).skip(4).limit(4)

    const men1 = await Product.find({ For: "Men" }).limit(4)
    const men2 = await Product.find({ For: "Men" }).skip(4).limit(4)

    const kids1 = await Product.find({ For: "Kids" }).limit(4)
    const kids2 = await Product.find({ For: "Kids" }).skip(4).limit(4)
    const banner = await Banner.find({ status: "display" })

    // var session;
    // session=req.session;
    res.render("costa", { women1, women2, men1, men2, kids1, kids2, isLogedIn, banner })

  } catch (error) {
    console.log(error.message);
  }

}



const loadLoginPage = (req, res) => {
  if (req.session.isAuth) {
    res.redirect('/')
  } else {
    res.render('userLogin')
  }
}

const tempstore = async (req, res) => {
  const { firstname, password, email } = req.body;

  const emailExist = await Users.findOne({ email: email });

  if (emailExist) {
    const errordata = 'Email already registered';
    return res.render('signup', { errordata });
  } else {
    try {
      req.session.user = {
        firstname: firstname,
        email: email,
        password: password,
      };
    } catch (error) {
      console.log(error.message);
    }

    res.redirect('/user/sendotp');
  }
};

const userLogout = (req, res) => {
  req.session.destroy();
  res.redirect('/user/login')
}

const generateOTP = () => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};



let OTPassword;

const sendOTP = async (req, res) => {
  const phone = req.body.phone
  const countryCode = req.body.countryCode
  const mobile = countryCode + phone
  console.log(mobile);
  const MobExist = await Users.findOne({ mobile: mobile });

  if (MobExist) {
    const errordata = 'Mobile already registered';
    return res.render('sendotp', { errordata });
  } else {
    req.session.user.mobile = mobile;
    OTPassword = generateOTP();

    client.messages
      .create({
        body: `Your OTP for login Warning Clothing is: ${OTPassword}`,
        from: '+16676604699',
        to: mobile,
      })
      .then((message) => {
        res.redirect('/user/verifyotp');
      })
      .catch((error) => {
        console.log('Error sending OTP:', error);
        res.render('sendotp', { errordata: 'Failed to send OTP' });
      });
  }
};


const verifyOTP = (req, res) => {
  const receivedOTP = req.body.otp;

  if (receivedOTP === OTPassword) {
    insertUser(req, res);
  } else {
    const errordata = 'Invalid OTP';
    res.render('verifyotp', { errordata });
  }
};

const insertUser = async (req, res) => {
  const newUser = req.session.user;
  const email = newUser.email

  try {
    const spassword = await securePassword(newUser.password);

    const user = Users({
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      password: spassword,
    });

    const result = await user.save();

    const userdata = await Users.findOne({ email: email });

    req.session.userId = userdata._id
    req.session.isAuth = "true"

    res.redirect('/user/homepage');
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userdata = await Users.findOne({ email: email });

    if (userdata) {
      if (userdata.status === "Active") {
        const passwordMatch = await bcrypt.compare(password, userdata.password);
        if (passwordMatch) {
          req.session.userId = userdata._id
          req.session.isAuth = "true"
          console.log(req.session.userId);
          res.redirect('/');
        } else {
          res.render('userLogin', { message: 'Invalid password' });
        }
      } else {
        res.render('userLogin', { message: 'Account blocked. Contact customer support' });
      }
    } else {
      res.render('userLogin', { message: 'Username not found' });
    }
  } catch (error) {
    res.render('userLogin', { message: 'Error in login to Costa. Try again...' });
    console.log(error)
  }
};

const loadUserlist = async (req, res) => {
  const users = await Users.find({})

  res.render('admin-customers', { users })
}

const loadAdduser = async (req, res) => {
  res.render('addUser')
}

const saveUser = async (req, res) => {
  const { firstname, email, mobile, password } = req.body
  try {
    const spassword = await securePassword(password)

    const user = new Users({
      firstname: firstname,
      email: email,
      mobile: mobile,
      password: spassword
    })
    await user.save()
    res.redirect('/admin/listUsers')
  } catch (error) {
    console.log(error);
  }
}


const loadEditUser = async (req, res) => {
  const id = req.session.userId
  //console.log(id);
  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(id) })

  res.render('editUser', { user })
}

const updateUser = async (req, res) => {
  const { firstname, email, mobile, password, id } = req.body
  console.log(password);
  const spassword = await securePassword(password)
  console.log(spassword);

  await Users.updateOne({ _id: new mongoose.Types.ObjectId(id) },
    { $set: { firstname: firstname, email: email, mobile: mobile, password: spassword } })


  res.redirect("/admin/listUsers")
}
const updateStatus = async (req, res) => {
  const { id, status } = req.body

  await Users.updateOne({ _id: new mongoose.Types.ObjectId(id) },
    { $set: { status: status } })

  if (status === 'Blocked') {
    // Destroy the user's session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // Redirect to the listUsers page or any other appropriate action
      res.redirect("/admin/listUsers");
    });
  } else {
    // If the status is not blocked, simply redirect to the listUsers page
    res.redirect("/admin/listUsers");
  }

}
const userProfileDetails = async (req, res) => {

  const id = req.session.userId

  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(id) })


  res.render('userProfile', { user })
}

const saveUserProfile = async (req, res) => {
  const { firstname } = req.body;
  const userid = req.session.userId
  try {
    await Users.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $set: { firstname: firstname } });
    res.redirect('/user/profile');

  } catch (error) {
    console.log(error);
  }

}

const changeEmail = async (req, res) => {
  const userid = req.session.userId
  const { newmail, curPassword } = req.body;

  try {
    const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) });

    if (!user) {

      return res.json({ success: false, message: "Invalid email address" });
    }

    const passwordMatch = await bcrypt.compare(curPassword, user.password);

    if (passwordMatch) {

      await Users.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $set: { email: newmail } });

      return res.json({ success: true, message: "Email changed successfully" });

    } else {
      // Incorrect password
      return res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "An error occurred" });
  }
}

const changePwd = async (req, res) => {
  const { currentPwd, newPwd, confirmPwd } = req.body;
  const userid = req.session.userId

  try {
    const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) });

    if (!user) {
      return res.json({ success: false, message: "An Error occured,Please Login Agian" });
    }

    const passwordMatch = await bcrypt.compare(currentPwd, user.password);
    if (passwordMatch) {
      if (newPwd !== confirmPwd) {
        return res.json({ success: false, message: "Passwords do not match" });
      }

      const newPassword = await securePassword(newPwd);
      await Users.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $set: { password: newPassword } });

      return res.json({ success: true, message: "Password changed successfully" });
    } else {

      return res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: "An error occurred" });
  }
};





let forgotPwdOTP
const forgotPwdSendOtp = async (req, res) => {
  const userid = req.session.userId;
  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) });
  const phoneNumber = user.mobile;

  forgotPwdOTP = generateOTP();

  client.messages
    .create({
      body: `Your OTP to change password is: ${forgotPwdOTP}`,
      from: '+16676604699',
      to: phoneNumber
    })
    .then(message => {
      res.json({ success: true });
    })
    .catch(error => {
      console.error(error.message);
      res.json({ success: false });
    });
};

const verifyPwdOtp = (req, res) => {

  const otp = req.body.otp
  if (otp === forgotPwdOTP) {

    res.json({ success: true })
  } else {

    res.json({ success: false });
  }
}

const updateForgotPwd = async (req, res) => {


  const { newPassword, confirmPassword } = req.body

  const userid = req.session.userId;

  if (newPassword !== confirmPassword) {

    res.json({ success: false })
  } else {
    try {

      const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) })

      const spassword = await securePassword(newPassword)

      await Users.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $set: { password: spassword } })

      res.json({ success: true })

    }
    catch (error) {
      console.log(error.message);
      res.json({ success: false })
    }
  }
}

let changeNumOTP
let newPhone
const newNumSendOtp = async (req, res) => {
  const { mobile } = req.body;
  const phoneNumber = mobile;
  newPhone = mobile;
  changeNumOTP = generateOTP();
  client.messages
    .create({
      body: `Your OTP to Change Phone Number is: ${changeNumOTP}`,
      from: '+16676604699',
      to: phoneNumber
    })
    .then(message => {
      res.json({ success: true });
    })
    .catch(error => {
      console.error(error.message);
      res.json({ success: false });
    });

}


const verifyChangePhoneOtp = async (req, res) => {
  const otp = req.body.otp
  console.log(otp);
  try {
    if (otp === changeNumOTP) {

      const userid = req.session.userId

      await Users.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $set: { mobile: newPhone } });

      res.json({ success: true });

    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
  }
}

const userProfileEditAddress = async (req, res) => {

  const id = req.session.userId

  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(id) })


  res.render('userProfile-edit-address', { user })
}

const userProfileAddressDetails = async (req, res) => {
  const id = req.session.userId

  const { name, mobile, locality, buildingname, landmark, city, state, pincode, addressType } = req.body

  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(id) })

  try {

    user.address.push({
      name: name,
      mobile: mobile,
      locality: locality,
      buildingName: buildingname,
      landmark: landmark,
      city: city,
      state: state,
      pincode: pincode,

      addressType: addressType
    });
    await user.save()

    res.redirect('/user/profileAddressList')

  } catch (error) {

    console.log(error.message);
  }


}

const userProfileOrdersList = (req, res) => {


  res.render('userProfile-orders-list', {})
}



const userProfileAddressList = async (req, res) => {

  const id = req.session.userId;

  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(id) });
  console.log(id);
  let address = [];
  if (user.address.length !== 0) {
    address = user.address;
  }

  res.render('userProfileAddressList', { address })
}

const addAddressFromCheckout = async (req, res) => {
  const id = req.session.userId;
  const {
    name,
    mobile,
    locality,
    buildingname,
    landmark,
    city,
    state,
    pincode,
    addressType,
  } = req.body;

  try {
    const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(id) }).populate("cart.product");

    user.address.push({
      name: name,
      mobile: mobile,
      locality: locality,
      buildingName: buildingname,
      landmark: landmark,
      city: city,
      state: state,
      pincode: pincode,
      addressType: addressType,
    });
    await user.save();


    res.redirect('/home/cart/selectAddress')
  } catch (error) {
    console.log(error.message);
  }
};

const updateAddress = async (req, res) => {

  const { name, mobile, locality, buildingname, landmark, city, state, pincode, addressType, id } = req.body

  const userid = req.session.userId
  try {

    await Users.updateOne(
      { _id: new mongoose.Types.ObjectId(userid), 'address._id': new mongoose.Types.ObjectId(id) },
      {
        $set: {
          'address.$.name': name,
          'address.$.mobile': mobile,
          'address.$.locality': locality,
          'address.$.buildingname': buildingname,
          'address.$.landmark': landmark,
          'address.$.district': city,
          'address.$.state': state,
          'address.$.pincode': pincode,
          'address.$.addressType': addressType,

        }
      }
    );
    res.redirect('/user/profileAddressList');
  } catch (error) {
    console.log(error.message);
  }
};

const updateAddressInCheckout = async (req, res) => {

  const { name, mobile, locality, buildingname, landmark, city, state, pincode, addressType, id } = req.body

  const userid = req.session.userId
  try {

    await Users.updateOne(
      { _id: new mongoose.Types.ObjectId(userid), 'address._id': new mongoose.Types.ObjectId(id) },
      {
        $set: {
          'address.$.name': name,
          'address.$.mobile': mobile,
          'address.$.locality': locality,
          'address.$.buildingname': buildingname,
          'address.$.landmark': landmark,
          'address.$.district': city,
          'address.$.state': state,
          'address.$.pincode': pincode,
          'address.$.addressType': addressType,

        }
      }
    );
    res.redirect('/home/cart/selectaddress');
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  const id = req.body.id;
  const userid = req.session.userId

  try {
    const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Users.updateOne(
      { _id: new mongoose.Types.ObjectId(userid) },
      { $pull: { address: { _id: new mongoose.Types.ObjectId(id) } } }
    );

    res.redirect('/user/profileAddressList');
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const currentOrders = async (req, res) => {
  const id = req.session.userId;

  const orders = await Order.find({ user: new mongoose.Types.ObjectId(id) }).populate('cart.product').sort({ createdAt: -1 })

  res.render('userProfile-orders-list', { orders })
}
const loadOrderDetails = async (req, res) => {

  const { orderId } = req.query;

  const order = await Order.findOne({ orderId }).populate('cart.product')

  res.render('orderDetails', { order })
}

const changeOrderStatus = async (req, res) => {

  const { orderId } = req.query;
  try {
    await Order.updateOne({ orderId: orderId }, { $set: { status: "Cancelled" } })
    const order = await Order.findOne({ orderId }).populate('cart.product')

    res.render('orderDetails', { order })
  } catch (error) {
    console.log(error);
  }

}


const generatePDFReport = async (orders, res) => {
  // Create a new PDF document
  const doc = new PDFDocument();
  // Pipe the PDF content to the response object
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(16).text('Order List', { align: 'center' });


  // Loop through orders and add relevant fields to the PDF
  orders.forEach((order) => {
    doc.text(`Order ID: ${order.orderId}`);

    doc.text(`Customer Name: ${order.user.firstname}`);

    doc.text(`Total Amount: ${order.totalPrice}`);

    doc.text(`Status: ${order.status}`);

    doc.text(`Payment Method: ${order.paymentMode}`);
    // Add more fields as needed
    doc.text('-----------------------------------------------');
  });

  // Finalize the PDF
  doc.end();
};


const generateExcelReport = async (orders, res) => {
  // Create a new Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Order List');

  // Define the columns
  worksheet.columns = [
    { header: 'Order ID', key: 'orderId' },
    { header: 'Customer Name', key: 'customerName' },
    { header: 'Total Amount', key: 'totalAmount' },
    { header: 'Status', key: 'status' },
    { header: 'Payment Method', key: 'paymentMode' },
    // Add more columns as needed
  ];


  // Add data to the worksheet
  orders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      customerName: order.user.firstname,
      totalAmount: order.totalPrice,
      status: order.status,
      paymentMode: order.paymentMode,
      // Add more fields as needed
    });
  });

  // Set response headers for Excel download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=order-list.xlsx');

  // Pipe the workbook to the response
  await workbook.xlsx.write(res);

  // End the response
  res.end();
};

const loadOrderPdf = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user');

    // Generate PDF report
    generatePDFReport(orders, res);
  } catch (error) {
    console.log(error.message);
  }
}

const loadOrderExcel = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user');

    // Generate Excel report
    generateExcelReport(orders, res);
  } catch (error) {
    console.log(error.message);
  }
}

const loadOrdersList = async (req, res) => {
  try {
      const page = req.query.page || 1; // Get the page number from the query parameters (default to 1)
      const itemsPerPage = 10; // Number of items to display per page
      const startIndex = (page - 1) * itemsPerPage;
      
      const totalOrders = await Order.find({}).countDocuments();
      const totalPages = Math.ceil(totalOrders / itemsPerPage);

      const orders = await Order.find({})
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(itemsPerPage)
          .populate('user');

      res.render('admin-orders', { orders, currentPage: page, totalPages });

  } catch (error) {
      console.log(error.message);
  }
}


const loadOrdersDateList = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Validate the startDate and endDate before using them in the query
    if (!startDate || !endDate) {
      return res.status(400).send('Both start date and end date are required.');
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
      return res.status(400).send('Invalid date format for start date or end date.');
    }

    // Create a query to filter orders by date range and sort by 'createdAt'
    const query = {
      createdAt: {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      },
    };

    const orders = await Order.find(query).sort({ createdAt: -1 }).populate('user');

    res.render('admin-orders', { orders, startDate, endDate });


  } catch (error) {
    console.log(error.message);
  }
}



const editOrderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body
  try {
    await Order.updateOne({ orderId }, { $set: { status: orderStatus } });

    res.redirect('/admin/orders');

  } catch (error) {
    console.log(error);
  }


}
const loadorderView = async (req, res) => {
  const orderId = req.query.orderId

  const order = await Order.findOne({ orderId }).populate('cart.product').populate("user")




  res.render('adminOrderView', { order })
}

const cancelOrder = async (req, res) => {
  const userid = req.session.userId;
  const { orderId, refundMode, cartId } = req.body;

  try {
    await Order.updateOne({ orderId: orderId }, { $set: { status: "Cancelled" } });
    await Order.updateOne(
      {
        orderId: orderId,
        'cart._id': new mongoose.Types.ObjectId(cartId)
      },
      {
        $set: {
          'cart.$.status': 'Cancelled'
        }
      }
    );

    if (refundMode === "wallet") {
      const cancelledOrder = await Order.findOne({ orderId: orderId });

      if (cancelledOrder) {
        const walletbalance = parseFloat(cancelledOrder.broughtPrice);

        if (!isNaN(walletbalance)) {
          console.log('Wallet Balance:', walletbalance);

          // Update the user's wallet balance
          await Users.updateOne(
            { _id: new mongoose.Types.ObjectId(userid) },
            { $inc: { wallet: walletbalance } }
          );
        } else {
          console.error('Invalid Wallet Balance in the cancelled order:', cancelledOrder);
        }
      } else {
        console.error('Cancelled order not found:', orderId);
      }
    }

    const order = await Order.findOne({ orderId }).populate('cart.product');
    res.render('orderDetails', { order });
  } catch (error) {
    console.log(error);
  }
};


const cancelCodOrder = async (req, res) => {
  console.log(req.body);
  const { orderId, cartId } = req.body

  try {
    await Order.updateOne(
      {
        orderId: orderId,
        'cart._id': new mongoose.Types.ObjectId(cartId)
      },
      {
        $set: {
          'cart.$.status': 'Cancelled'
        }
      }
    );



    const order = await Order.findOne({ orderId: orderId }).populate('cart.product');

    res.render('orderDetails', { order });
  } catch (error) {
    console.log(error);
  }


}



const cancelWalletOrder = async (req, res) => {

  const { orderId, cartId } = req.body

  try {
    await Order.updateOne(
      {
        orderId: orderId,
        'cart._id': new mongoose.Types.ObjectId(cartId)
      },
      {
        $set: {
          'cart.$.status': 'Cancelled'
        }
      }
    );
    const orderprice = await Order.findOne(
      {
        orderId: orderId,
        'cart._id': new mongoose.Types.ObjectId(cartId)
      },
      {
        'cart.broughtPrice': 1
      }
    );

    const broughtPrice = orderprice.cart[0].broughtPrice
    console.log(orderprice);
    console.log(broughtPrice);

    const userid = req.session.userId

    const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) })

    user.wallet += Number(broughtPrice)
    await user.save()
    const order = await Order.findOne({ orderId: orderId }).populate('cart.product');

    res.render('orderDetails', { order });
  } catch (error) {
    console.log(error);
  }


}

const userWalletDetails = async (req, res) => {

  const userid = req.session.userId

  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userid) })
  const walletBalance = user.wallet


  res.render('userWallet', { walletBalance })
}

const downloadInvoice = async (req, res) => {


  try {

    const orderId = req.query.orderId
    const order = await Order.findOne({ orderId: orderId }).populate('cart.product')
    const products = []

    for (let i = 0; i < order.cart.length; i++) {
      const productDetails = {

        "quantity": order.cart[i].quantity,
        "description": order.cart[i].product.description,

        "price": order.cart[i].broughtPrice,

      }
      products.push(productDetails)
    }

    const data = {

      "client": {

        "company": order.shippingAddress.name,
        "address": order.shippingAddress.buildingName,
        "zip": order.shippingAddress.pincode,
        "city": order.shippingAddress.city,
        "country": order.shippingAddress.state,
      },

      // Now let's add our own sender details
      "sender": {
        "company": "Ashion Clothing PVT LTD",
        "address": "Penny Parkway",
        "zip": "682012",
        "city": "Kochi",
        "country": "India"
      },


      // Let's add some standard invoice data, like invoice number, date and due-date
      "information": {
        // Invoice number
        "number": order.orderId,
        // Invoice data
        "date": order.createdAt,
        // Invoice due date

      },
      "products": products,

      "bottom-notice": "This is a computer generated invoice.It doesnt require a physical signature",
      "settings": {
        "currency": "INR",
        "tax-notation": "gst"// See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        /* 
         "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')         
         "tax-notation": "gst", // Defaults to 'vat'
         // Using margin we can regulate how much white space we would like to have from the edges of our invoice
         "margin-top": 25, // Defaults to '25'
         "margin-right": 25, // Defaults to '25'
         "margin-left": 25, // Defaults to '25'
         "margin-bottom": 25, // Defaults to '25'
         "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
         "height": "1000px", // allowed units: mm, cm, in, px
         "width": "500px", // allowed units: mm, cm, in, px
         "orientation": "landscape", // portrait or landscape, defaults to portrait         
         */
      },

      /*
          Last but not least, the translate parameter.
          Used for translating the invoice to your preferred language.
          Defaults to English. Below example is translated to Dutch.
          We will not use translate in this sample to keep our samples readable.
       */


      /*
          Customize enables you to provide your own templates.
          Please review the documentation for instructions and examples.
          Leave this option blank to use the default template
       */
      customize: {
        template: btoa(customTemplate),
      },
    };


    let file = "AshionClothing_" + order.orderId + ".pdf"

    easyinvoice.createInvoice(data, function (result) {
      // Set the appropriate headers for browser download
      res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Send the generated PDF data as response to trigger browser download
      res.send(Buffer.from(result.pdf, 'base64'));
    });
  } catch (error) {
    // Handle the error here
    console.error("An error occurred:", error);
    res.status(500).send("Internal server error");
  }

}

const loadWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userId) }).populate('wishlist.product');

    if (!user) {
      // Handle the case where the user is not found
      return res.status(404).send("User not found");
    }

    const wishlist = user.wishlist || []; // Ensure wishlist is defined even if it's empty

    res.render('wishlist', { wishlist });
  } catch (error) {
    console.error("Error fetching user:", error);
    // Handle the error appropriately, e.g., send a 500 Internal Server Error response
    res.status(500).send("Internal Server Error");
  }
};





module.exports = {
  loadUserSignup,
  tempstore,
  loadSendOtp,
  sendOTP,
  loadVerifyOtp,
  loadHomepage,
  loadLoginPage,
  verifyLogin,
  insertUser,
  verifyOTP,
  securePassword,
  loadUserlist,
  loadAdduser,
  saveUser,
  loadEditUser,
  updateUser,
  userLogout,
  updateStatus,
  userProfileDetails,
  userProfileAddressDetails,
  userProfileOrdersList,
  saveUserProfile,
  changeEmail,
  changePwd,
  forgotPwdSendOtp,
  verifyPwdOtp,
  updateForgotPwd,
  newNumSendOtp,
  verifyChangePhoneOtp,
  userProfileAddressList,
  addAddressFromCheckout,
  userProfileEditAddress,
  updateAddress,
  deleteAddress,
  currentOrders,
  loadOrderDetails,
  changeOrderStatus,
  loadOrdersList,
  editOrderStatus,
  loadorderView,
  userWalletDetails,
  cancelOrder,
  cancelCodOrder,
  cancelWalletOrder,
  downloadInvoice,
  loadWishlist,
  updateAddressInCheckout,
  loadOrderPdf,
  loadOrderExcel,
  loadOrdersDateList


};
