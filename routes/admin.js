const express = require('express');
const router = express.Router();
const fileUpload=require("express-fileupload")
//var productHelper=require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const cateHelpers = require('../helpers/cate-helpers');

const {home,addpdGet,addpdPost,editpdGet,editpdPost,hidepdGet,unhidepdGet,categoryviewGet,addcatGet,addcatPost,editcatGet,editcatPost,hidecatGet,unhidecatGet,dashGet,adlogGet,adlogPost,adlgoutGet,adusrGet,adblkGet,adunblkGet,usrorder,statuschange,adminhomePost,admnviewordrpdctGet,salereport,viewCouponGet,addCouponGet,addCouponPost,editCouponGet,editCouponPost,deleteCouponPost,bannerGet,
  addBannerGet,
  addBannerPost,
  deleteBannerGet,userorderPost,adusrPost,saleReportGet, dateFilterPost} = require("../controller/admin-controller");

const  multer = require('multer');

// const upload = multer({ dest:'public/images'});
const path = require("path");
// const { request } = require('../app');
const upload = multer({
  dest: "public/images",
  limits: {
    fieldSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
   
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
     
      const originalExt = path.extname(file.originalname).toLowerCase();
      if (originalExt === ext) {
        cb(null, true); // Accept the file
      } else {
        cb(new Error("Invalid file extension."), false); // Reject the file
      }
    } else {
      cb(new Error("Only image files are allowed."), false); // Reject the file
    }
  },
});








const verifyLogin=(req,res,next)=>{
  if(req.session.admin && req.session.admin.loggedIn){
    next()
  }else{
    res.redirect('/admin/adminLogin')
  }
}

/* GET users listing. */
router.get('/',verifyLogin,home);

router.post('/',verifyLogin,adminhomePost)

router.get('/add-product',verifyLogin,addpdGet)

router.post('/add-product',verifyLogin, upload.array("Image", 4),addpdPost)


router.get('/edit-product/:id',verifyLogin,editpdGet)

router.post('/edit-product/:id', verifyLogin, upload.array("Image", 4),editpdPost);

router.get('/hide-product/:id',verifyLogin,hidepdGet)

router.get('/unhide-product/:id',verifyLogin,unhidepdGet)


//--------------category----------//

router.get('/view-category',verifyLogin, categoryviewGet);

 router.get('/add-category',verifyLogin,addcatGet)


router.post('/add-category',upload.array("Image", 1),addcatPost)


router.get('/edit-category/:id',verifyLogin,editcatGet)

router.post('/edit-category/:id', verifyLogin,upload.array("Image", 1),editcatPost)

router.get('/hide-category/:id',verifyLogin,hidecatGet)

router.get('/unhide-category/:id',verifyLogin,unhidecatGet)





//----------admin login-------//

router.get('/dashbord',verifyLogin,dashGet)




router.get('/adminLogin',adlogGet)


router.post('/adminLogin',adlogPost)




router.get("/adminLogout",adlgoutGet)

router.get("/user-data",verifyLogin,adusrGet)

router.post("/user-data",verifyLogin,adusrPost)

router.get('/block-user/:id',verifyLogin,adblkGet)

router.get('/unblock-user/:id',verifyLogin,adunblkGet)

router.get('/user-order',verifyLogin,usrorder)

router.post('/user-order',verifyLogin,userorderPost)

router.get("/status-change",statuschange);

router.get('/view-order',verifyLogin,admnviewordrpdctGet)

router.post('/download',salereport)

//------coupon-----//

router.get('/view-coupon',verifyLogin, viewCouponGet)

router.get('/add-coupon',verifyLogin, addCouponGet)

router.post('/add-coupon',verifyLogin,addCouponPost)

router.get('/edit-coupon/:id',verifyLogin, editCouponGet)

router.post('/edit-coupon',verifyLogin, editCouponPost)

router.post('/delete-coupon',verifyLogin, deleteCouponPost)

//------banner section-----//

// banner management get method //
router.get('/banner',bannerGet );

// add banner get method /
router.get('/addBanner',addBannerGet);

// banner management post /
router.post('/addBanner',addBannerPost);

//delete-banner get //
router.get('/delete-banner/:id',verifyLogin,deleteBannerGet);

// router.get('/sales',verifyLogin,salesReport)


router.get('/salereport',saleReportGet)

router.post('/date-filter',verifyLogin,dateFilterPost)



module.exports = router;
