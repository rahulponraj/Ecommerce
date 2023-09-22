const { default: mongoose } = require('mongoose')
const Category=require('../models/categoryModel')



const loadListCategory=async(req,res)=>{
  const categories=await Category.find({})      
   res.render('listCategories',{categories})
}

const loadAddCategory=(req,res)=>{
res.render('addCategories')
}


const addCategory = async (req, res) => {
  const category = req.body.category;

  // Check if the category already exists in the database
  const existingCategory = await Category.findOne({ category: category });

  if (existingCategory) {
    // Category already exists, show an error message
    return res.status(400).send('Error: Category already exists.');
  }

  const categories = new Category({
    category: category
  });

  await categories.save();

  res.redirect('/admin/categories');
};



const loadEditCategory=async(req,res)=>{
  const id =req.query.id;
  try{
  const category=await Category.findOne({_id:new mongoose.Types.ObjectId(id)})
 
  res.render('editCategory',{category})
  }catch(error){
      console.log(error.message);
  }
}

const updateCategory=async(req,res)=>{ 
  const{category,status,id}=req.body
  try{
  await Category.updateOne({_id:new mongoose.Types.ObjectId(id)},{$set:{category:category,status:status}})

  res.redirect('/admin/categories')
  }catch(error){
      console.log(error.message);
  }
}

const deleteCategory=async(req,res)=>{
  const id =req.query.id;
  try{
  await Category.deleteOne({_id:new mongoose.Types.ObjectId(id)})

  res.redirect('/admin/categories')
} catch(error){
  console.log(error);
}
}

module.exports={
    loadListCategory,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    updateCategory,
    deleteCategory
}