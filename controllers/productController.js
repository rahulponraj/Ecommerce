const Product=require('../models/productModel');
var fs = require('fs');
var path = require('path');
const Category=require('../models/categoryModel')
const { default: mongoose } = require('mongoose');
const multer = require('multer');

const loadProductList=async(req,res)=>{

  try{
  const products=await Product.find({}).populate('category')
 
      res.render('admin-product',{products})
  }catch(error){
    console.log(error);
  }
 
}

const showSingleProduct=async(req,res)=>{
  const id =req.query.id;
 
const product=await Product.find({_id:new mongoose.Types.ObjectId(id)})
if(req.session.isAuth){
  isLogedIn="true";
}else{
  isLogedIn="false";
}
    res.render('singleProduct',{product,isLogedIn})

}

const listProducts=async(req,res)=>{
   const For=req.query.For
   if(req.session.isAuth){
    isLogedIn="true";
  }else{
    isLogedIn="false";
  }
  try{
      const product=await Product.find({For:For,status:"Active"})
      const category=await Category.find({status:"Active"})
      res.render('list-products',{product,category,isLogedIn})
   }catch(error){
       console.log(error)
   }
}


const loadEditproduct=async(req,res)=>{
 try{
  const id =req.query.id;
  const product=await Product.findOne({_id:new mongoose.Types.ObjectId(id)})
  const category=await Category.find({status:"Active"})
 
  res.render('edit-product',{product,category})
}catch(error){
  console.log();
}
}

const deleteProduct=async(req,res)=>{
  const {id,status}=req.query.id
  try{
  await Product.deleteOne({_id:new mongoose.Types.ObjectId(id)},{$set:{status:status}})
  res.redirect('/admin/listProducts')
  }catch(error){
      log(error.message)
  }
}

const loadAddProduct=async(req,res)=>{
  const category=await Category.find({status:"Active"})
  res.render('admin-add-product',{category});
}





const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

const uploadMultiple = upload.array("images", 4);


const saveProduct = async (req,res) => {
  // console.log(req.body);
  try {
    const { title, description, category, price, size, saleprice, For, color, stock, brand } = req.body;

    const images = req.files.map((file) => {
      return {
        data:  fs.readFileSync(path.join(__dirname, '..', 'images', file.filename)),
        contentType: file.mimetype,
      };
    });

    const product = new Product({
      title,
      description,
      category,
      price,
      saleprice,
      size,
      stock,
      For,
      color,
      brand,
      images,
    });
    await product.save();

    console.log(req.files);
    res.redirect('/admin/listProducts');
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}


const updateProduct=async(req,res)=>{
  try {
  
    const { title, description,For,price,saleprice, stock,size,category,brand,quantity,color,id} = req.body;
    let Updatedstock=Number(stock)
    const productId = new mongoose.Types.ObjectId(id);
    let product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    product.title = title;
    product.description = description;
    product.For=For;
    product.price = price;
    product.saleprice = saleprice;
    product.stock = Updatedstock;
    product.size=size;
    product.color=color;
    product.brand=brand;
    product.category=category

     // Handle image deletion
     if (req.body.deletedImages && Array.isArray(req.body.deletedImages)) {
      // Get the indices of images to delete
      const deletedIndices = req.body.deletedImages.map((index) => parseInt(index));

      // Remove the images at the specified indices
      product.images = product.images.filter((image, index) => !deletedIndices.includes(index));
    }
   
    if (req.files && req.files.length > 0) {
     
    
      const newImages = req.files.map((file) => {
        return {
          data: fs.readFileSync(path.join(__dirname, '..', 'images', file.filename)),
          contentType: file.mimetype
        };
      });

      // Append new images to the beginning of the image array
      product.images = newImages.concat(product.images);
    // Remove any extra images beyond a certain limit (e.g., keep only the first 4 images)
    const maxImages = 4;
    if (product.images.length > maxImages) {
      product.images = product.images.slice(0, maxImages);
    }
  }

  await product.save();

    res.redirect('/admin/listProducts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}

const filterProducts=async(req,res)=>{
  try {

    const { price, suitableFor, categorys, discount } = req.body;

    const pipeline = [
      {
        $addFields: {
          calculatedDiscount: {
            $subtract: [
              100,
              { $multiply: [ { $divide: [ "$saleprice", "$price" ] }, 100 ] }
            ]
          }
        }
      },
      {
        $match: {
          calculatedDiscount: discount === 'true' ? { $gt: 0 } : { $exists: true },
          price: { $lte: parseInt(price) },
          For: suitableFor,
          category: new mongoose.Types.ObjectId(categorys),
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      }
      // Add more stages to the pipeline as needed
    ];
    
    const product = await Product.aggregate(pipeline);

   
  
    if(req.session.isAuth){
      isLogedIn="true";
    }else{
      isLogedIn="false";
    }
    const category=await Category.find({})
    res.render('list-products',{product,isLogedIn,category})
  } catch (err) {
    console.error('Error performing aggregation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const searchProduct=async(req,res)=>{

const keyword=req.body.keyword


try {
  const product = await Product.find({
    $text: { $search: keyword },
    status: "Active"
  })
  .populate("category")
  .exec(); // Populate the category field if needed
  

const category=await Category.find({})
res.render('list-products',{category,product})

} catch (error) {
  throw new Error(error.message);
}
}
const loadStockDetails=async(req,res)=>{

  try{
  const products=await Product.find({}).populate('category')
 
      res.render('adminStockReport',{products})
  }catch(error){
    console.log(error);
  }
 
}
const deleteImage = async (req, res) => {
  try {
    const { productId, imageIndex } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Check if the imageIndex is valid
    if (imageIndex >= 0 && imageIndex < product.images.length) {
      // Remove the image at the specified index
      product.images.splice(imageIndex, 1);
      await product.save();
    }

    res.redirect('/admin/editProduct?id=' + productId); // Redirect to the product editing page
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};



module.exports={
  loadProductList,
  loadEditproduct,
  updateProduct,
  deleteProduct,
  loadAddProduct,
  saveProduct,
  showSingleProduct,
  listProducts,
  uploadMultiple,
  filterProducts,
  searchProduct,
  loadStockDetails,
  deleteImage
  
}