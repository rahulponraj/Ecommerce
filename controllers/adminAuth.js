const adminLoggedOn = (req, res, next) => {
   
      
      if (req.session.isAdminAuth === "true") {
       
        return next();
      }
    
    
      res.redirect('/admin');
    };
    
    module.exports = { adminLoggedOn };
    