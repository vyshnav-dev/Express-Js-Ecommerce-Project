const express = require('express');
const router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const cateHelpers = require('../helpers/cate-helpers');
const userHealpers=require('../helpers/user-helpers')
const otpGenerator = require('otp-generator') 
const nodemailer = require('nodemailer')
const alert=require('alert')
const{home,viewCategory,loginGet,signGet,signPost,otpPost,resendOtpPost,loginPost,logoutGet,cartGet,addCartGet,changePdctQuantityPost,removePost,prodctdetaGet,allpdctGet,plcodrGet,plcodrPost,ordersucsGet,ordersmmryGet,useExist,addNewAddressPost,remvAddress,viewordrpdctGet,cancelOrder,deleteAddrs,userallpdctPost,userprofileGet,userprofilePost,edituserAddress,edituseraddressPost,deleteAddressGet,paymentresult,homePost,applyCouponPost,userWhishlist,addWhishlist,removeWhishlist,returnOrder,useWalletPost,invoiceReport,forgotGet,enterOtp,errorGet, resetpswdPost}=require('../controller/user-controller');
const { reset } = require('nodemon');




const verifyLogin=async(req,res,next)=>{
  if(req.session.user && req.session.user.loggedIn){
    let userBlocked=await userHealpers.getUser(req.session.user._id)
    if(userBlocked.isBlocked==true){
      res.redirect('/login')
    
    }else{
     next();
    }
  }else{
    res.redirect('/login')
  }
}



var email;
var otp;

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'granville44@ethereal.email',
      pass: 'KbYZwsZZkjZguqM7GZ'
  }
});

/* GET home page. */
router.get('/',home);

router.post('/',homePost);

router.get('/view-category',viewCategory);

router.get('/login',loginGet)

router.get('/signup',signGet)


//----------new------//

router.post("/signup", signPost);


router.post("/otp", otpPost);



router.post('/resend-otp',resendOtpPost);

  
   
    
    
    
  
      








router.post('/login',loginPost);



router.get('/logout',logoutGet)

router.get('/cart',verifyLogin,cartGet)

router.get('/add-to-cart/:id',verifyLogin,addCartGet)

router.post('/change-product-quantity',changePdctQuantityPost)

router.post('/remove-from-cart',removePost)

router.post('/romove-address',remvAddress)

router.get('/place-order', verifyLogin,plcodrGet)

router.post('/place-order',plcodrPost)

router.get('/order-success',ordersucsGet)

router.get('/order-summery',verifyLogin,ordersmmryGet)

router.get('/view-order-products/:id',viewordrpdctGet)

router.get('/use_address',verifyLogin,useExist)

router.post('/add-new-address',addNewAddressPost)

router.get('/delete-address',verifyLogin,deleteAddrs)

router.get('/productdetails/:id',verifyLogin,prodctdetaGet)

router.get('/all-product',verifyLogin,allpdctGet)

router.post('/all-product',verifyLogin,userallpdctPost)
  
router.get("/cancel-order",cancelOrder);

router.get('/user-profile',verifyLogin,userprofileGet);

router.get('/user-profile',verifyLogin,userprofileGet )

router.post('/add-new-address-profile',userprofilePost)

router.get('/edit-address',verifyLogin, edituserAddress)

router.post('/edit-address',edituseraddressPost)

router.get('/delete-profile-adress',deleteAddressGet)

router.post('/verify-payment',paymentresult)

router.post('/apply-coupon',applyCouponPost)

router.get('/wishlist',verifyLogin,userWhishlist)

router.get('/add-to-Wishlist/:id',verifyLogin,addWhishlist)

router.post('/remove-from-wishlist',removeWhishlist)


router.get('/return-order',verifyLogin,returnOrder)

router.post('/use-wallet',verifyLogin,useWalletPost)

router.post('/download-invoice',invoiceReport)

router.get("/forgot-password",forgotGet);

router.post("/Enter-otp", enterOtp);



router.get('/error',errorGet)





module.exports = router;
