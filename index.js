const express = require("express");
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const db = require('./config/db');
const orderid = require('order-id')('key');
db.connect();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.static('public'));   
app.set('view engine', 'ejs');
app.set('views', './views');  


  
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge:1200000}
}));


const homepageRouter=require('./Routes/homepageRouter');
const userRouter=require('./Routes/userRouter')
const adminRouter=require('./Routes/adminRouter')
const productRouter=require('./Routes/productRouter')

app.use('/',homepageRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.use('/home',productRouter)


app.use((req, res, next) => {
  res.status(404).render('404');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});
