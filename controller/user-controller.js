const productHelpers = require('../helpers/product-helpers');
const cateHelpers = require('../helpers/cate-helpers');
const userHealpers=require('../helpers/user-helpers')
const couponHelpers=require("../helpers/coupon-helpers")
const otpGenerator = require('otp-generator') 
const nodemailer = require('nodemailer')
const alert=require('alert');
const { response } = require('express');
const adminHelpers = require('../helpers/admin-helpers');
const PDFDocument = require("pdfkit");



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


async function home(req, res, next) {
  const user=req.session.user
    console.log(user);
    let cartCount=null;
    let banners=await adminHelpers.getBanners();
    if(req.session.user){
     cartCount= await userHealpers.getCartCount(req.session.user._id)
    }
    productHelpers.getLatestProducts().then((products)=>{
      cateHelpers.getAllCategory().then((category)=>{
      res.render('user/view-products',{products,user,category,guest:true,cartCount,banners})
     })
    })
    
  }

  function homePost(req, res, next) {
    const user = req.session.user;
    let searchq = String(req.body.search);
    userHealpers
      .searchProducts(searchq)
      .then((products) => {
        res.render('user/view-products', { products, user:true });
      })
      .catch((err) => {
        console.log(err);
        res.redirect('/error');
      });
  }


  function viewCategory(req, res, next) {
    let user=req.session.user
    console.log(user);
    cateHelpers.getAllCategory().then((category)=>{
     
      res.render('user/view-category',{category,user})
     })
    
  }


  function loginGet(req,res){
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
      res.render('user/login',{"loginError":req.session.loginError,"blockError":req.session.blockError})
      req.session.loginError=false
      req.session.blockError=false
    }
    
  }

  function signGet(req,res){
    res.render('user/signup',{"loginError":req.session.loginError})
    req.session.loginError=false;
  }

  function signPost(req, res){
    userHealpers.doSignup(req.body).then((response) => {
      if (response == 1) {
        req.session.loginError = "Email already used";
        res.redirect("/signup");
      }
      if (response != 1) {
        const { name, Email, password } = req.body;
        let userDetails = req.body;
        req.session.userDetails=req.body;
        console.log(userDetails)
        console.log('----------------userDetails   first sign up------------')
  
        otp = otpGenerator.generate(6, {
          digits: true,
          alphabets: false,
          upperCase: false,
          specialChars: false,
        });
  
        const mailOptions = {
          from: 'granville44@ethereal.email',
          to: Email,
          subject: "OTP for sign up",
          text:` Your OTP is ${otp}`,
        };
  
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
            res.status(500).send({ message: "Error sending OTP email" });
            client.close();
            return;
          }
        });
  
        // Set a timeout of 60 seconds
        setTimeout(() => {
          otp = null;
          console.log('otp expired');
        }, 40000);
  
        res.render("user/otp", { userDetails, otp });
      }
    });
  }

  async function otpPost (req, res){
    // userHelpers.doMailCheck(req.body).then((status)=>{        //------------------
  
    //   if(status.status){
  
    //     userHelpers.doMailVarifySuccess(req.body)
    //     res.redirect("/login")
  
    //   }else{                                                      //5c^>
    //     console.log("wrong otp"+req.session.UserOtp)
    //     let otp=req.session.UserOtp
    //     userHelpers.deleteBlockedUser(otp)
  
    //     res.redirect('/signup')
    //   }
    // })                                                        //------------------
    
    if (otp == req.body.otp) {
      console.log( req.session.userDetails)
      console.log('--------------req.session.body---------282')
      const {
       Name,
       Email,
       Password,
       ConformPassword
      } = req.session.userDetails;
  
      
      await userHealpers.doSignUpSuccess({
        Name: Name,
        Email: Email,
        Password: Password,
        ConformPassword: ConformPassword,
      });
      res.redirect("/login");
      alert("account created");
    } else {
      alert("wrong otp");
      res.redirect("/signup");
    }
  
    // if(req.session.UserOtp==req.body.otp){           //=====================================
    //   res.redirect('/login')
    // }else{
    //   alert('wrong otp')
    //   res.redirect('/signup')
    //   req.session.UserOtp=null;
    // }
  }

  function resendOtpPost(req,res){
    console.log(req.body);
    let userDetails = req.session.userDetails;
    console.log(userDetails)
    console.log('-------userdetails----------')
    var userEmail = req.session.userDetails.Email;
    console.log(userEmail)
  
   console.log("k----------------------")
  
    // Check if OTP has expired
    if (!otp) {
      // Generate a new OTP
      otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });
  
      // Set a new timeout of 60 seconds
      setTimeout(() => {
        otp = null;
        console.log('otp expired');
      }, 40000);
    }
  
    const mailOptions = {
      from: 'granville44@ethereal.email',
      to: userEmail,
      subject: "OTP for sign up",
      text: `Your Resent OTP is ${otp}`,
    };
  
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        client.close();
        return;
      }
    });
  
    res.render("user/otp", { userDetails });
  }

  function loginPost(req, res) {
    userHealpers.doLogin(req.body).then((response) => {
        if (response.status) {
          req.session.user = response.user;
          req.session.user.loggedIn = true;
          res.redirect('/');
        }
        else if(response==1){
          req.session.blockError="!you are blocked"
          res.redirect('/login')
        }
         else {
          req.session.loginError = "Invalid username or password";
          res.redirect('/login');
        }
      })
      .catch((error) => {
        // Handle the error here
        console.log("An error occurred during login:", error);
        // Set an appropriate error message or redirect to an error page
        req.session.userloginError = "An error occurred during login. Please try again.";
        res.redirect('/login');
      });
  }


  function logoutGet(req,res){
    req.session.user=null
    res.redirect('/')
  }

  async function cartGet(req,res){
    
     let userId=req.session.user._id
     let user = await userHealpers.getUser(userId)
    let products= await userHealpers.getCartProducts(user._id)
    if(products.length){
    let total=await userHealpers.getTotalAmount(user._id)
   
     
     res.render('user/cart',{products,user,total})
    }
    else{
     req.session.cartEmpty = "Your cart is empty"
     let emptyError = req.session.cartEmpty
     res.render('user/cart',{user:req.session.user,emptyError})
}
  }

function addCartGet(req,res){
   
    userHealpers.addToCart(req.params.id,req.session.user._id).then(()=>{
     res.json({status:true})
    })
  
  }

  async function changePdctQuantityPost(req,res){
    console.log(req.body);
    let stock = await productHelpers.getStock(req.body)
    console.log(req.body.quantity)
    console.log(stock.Stock)
    if(stock.Stock > req.body.quantity){
    userHealpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total=await userHealpers.getTotalAmount(req.body.user)
      res.json(response)
      
    })
  }else {
    let response = {err:"out of sock"}
    res.json(response)
  }
  }

 

  function removePost(req,res,next){
    userHealpers.removeFromCart(req.body).then((response)=>{
      res.json(response)
    })
  }

  function remvAddress(req,res,next){
    userHealpers.removeAddress(req.body).then((response)=>{
      res.json(response)
    })
  }

  async function prodctdetaGet(req,res){
    let product = await productHelpers.getProductDetails(req.params.id)
    let user = req.session.user
      console.log(product)
      
      res.render("user/product-details.hbs",{product,user:true,guest:true,user})
  
  }

  function allpdctGet(req, res, next) {
    let user=req.session.user
    console.log(user);
    let val = Number(req.query.p)
      console.log(val)
     productHelpers.getAllProductsPagination(val).then((products)=>{
      console.log(products);
        res.render('user/all-product',{user:true,products})
      }) 
    productHelpers.getAllProducts().then((products)=>{
      
      res.render('user/all-product',{products,user,guest:true})
     })
      // ----pagination-----//
        
      
    }

    function userallpdctPost(req, res, next) {
      const user = req.session.user;
      let searchq = String(req.body.search);
      userHealpers
        .searchProducts(searchq)
        .then((products) => {
          res.render('user/all-product', { products, user:true });
        })
        .catch((err) => {
          console.log(err);
          res.render('user/all-product', { err, user:true });
        });
       
    }

    


   async function plcodrGet(req,res){
      let userId=req.session.user._id
      let user=await userHealpers.getUser(userId)
      let userAddresses=await userHealpers.getUserAddress(req.session.user._id)
      let total=await userHealpers.getTotalAmount(user._id)
      req.session.user.pAmount=total
      req.session.usedCoupon=null
     
      res.render('user/place-order',{user,userAddresses,total})
    }

    async function plcodrPost(req,res){
      let products=await userHealpers.getCartProductList(req.body.userId)
      // let totalPrice=await userHealpers.getTotalAmount(req.body.userId)

      let total=req.session.user.pAmount
      userHealpers.placeOrder(req.body,products,total).then((orderId)=>{
        req.session.orderId=orderId
        if(req.body['payment-method']==='COD')
        {
          res.json({codSuccess:true})
        }else{
            userHealpers.generateRazorpay(orderId,total).then((response)=>{
              res.json(response)
            })
        }
        
      })
      console.log(req.body);
    }

    async function ordersucsGet(req,res){
      let user = req.session.user;
  let price = req.session.user.pAmount;
   let amount=req.session.user.walletBalance;
  let id=req.session.orderId

  if(req.session.walletApply){
    userHealpers.decrementAmountWallet(amount,user._id)
    req.session.walletApply=false;
    req.session.walletBalance = 0;
  }

  if (req.session.usedCoupon) {
    let usedCoupon = req.session.usedCoupon;
    userHealpers.deleteCoupon(user._id, usedCoupon);
    req.session.usedCoupon = null;
    req.session.couponDiscount = false;
  }

  let coupon = await couponHelpers.giveCoupon(price);
  if (coupon) {
    let userId = user._id;
    userHealpers.addCouponUser(userId, coupon);
  }
  req.session.user.pAmount = 0;
  let order=await userHealpers.getOrder(id)
  productHelpers.changeQuantity(order.products)
  req.session.orderId=null
 res. render('user/order-success',{user,coupon})

      // res.render('user/order-success',{user:req.session.user})
    }

  async function ordersmmryGet(req,res){

   // let user=req.session.user 
  let val = Number(req.query.p);
  console.log(val);
 userHealpers.ordersummeryPagination(val).then((orders) => {
    
    // res.render("admin/user-order", { admin: true, usersOrders});

    
      // let orders = await userHealpers.getUserOrders(req.session.user._id);
      // Extracting and reformatting the date for each order
      orders.forEach((order) => {
        const dateParts = order.date.toISOString().substring(0, 10).split("-");
        order.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      });
      res.render('user/order-summery', { user: req.session.user,orders});
    });
    
    }

    async function viewordrpdctGet(req,res){
      let products=await userHealpers.getOrderProducts(req.params.id)
      res.render('user/view-order-products',{user:req.session.user,products,user:true})
    }

    async function useExist(req, res){
      let Id = req.query.id;
      let user = req.session.user
      // let total=req.session.user.pAmount
      let userAddresses = await userHealpers.getUserAddress(user._id)
      let userAddress=await userHealpers.getOneAddress(Id)
      let total = await userHealpers.getTotalAmount(user._id);
      // if(req.session.couponDiscount){
      //   total=total-req.session.couponDiscount
      // }
      req.session.user.pAmount=total
      req.session.usedCoupon=null
     
      res.render('user/place-order', { userAddresses, user,total,userAddress });
    }

    function addNewAddressPost(req,res){
     
      let userId = req.body.userId;
      let addressobj = {
       name:req.body.firstname,
       address:req.body.address,
       pincode:req.body.pincode,
       phone:req.body.phone
  }
  userHealpers.addNewAddress(userId,addressobj).then(()=>{
    res.redirect('/place-order')
  })
}

    function deleteAddrs(req,res){
      let Id=req.query.id
      userHealpers.deleteAddress(Id)
      res.redirect('/place-order')
    }
    

    async function cancelOrder (req, res){
      let id = req.query.id;
      let status = req.query.st
      await userHealpers.cancelOrder(id,status);
      res.redirect("/order-summery");
    }

   

    // user profile management//
    async function userprofileGet(req,res){
  let user = req.session.user
  // let user = await userHelpers.userDetails(userSession._id)
  let userAddresses = await userHealpers.getUserAddress(user._id)
  // let orderDetails = await userHelpers.getOrderDetails(userSession._id)
  console.log(user) 
  res.render('user/user-profile',{user,userAddresses})
}



 function userprofilePost(req,res){
  let userId = req.body.userId;
  let addressobj = {
    name:req.body.firstname,
    address:req.body.address,
    pincode:req.body.pincode,
    phone:req.body.phone
  }
  userHealpers.addNewAddress(userId,addressobj).then(()=>{
    res.redirect('/user-profile')
  })
}

async function  edituserAddress (req,res){
  let user = req.session.user;
  let addressId = req.query.id;
  let Address = await userHealpers.getOneAddress(addressId) 

  res.render('user/edit-address',{Address,user})
}

 function  edituseraddressPost(req,res){
  let Id = req.query.id;
  let addressobj = {
    name:req.body.firstname,
    address:req.body.address,
    pincode:req.body.pincode,
    phone:req.body.phone
 }
 userHealpers.editAddress(Id,addressobj) 
 res.redirect('/user-profile')
 }

function deleteAddressGet(req,res){
  let Id = req.query.id;

 userHealpers.deleteAddress(Id) 
res.redirect('/user-profile')
}

function paymentresult(req,res){
  console.log(req.body);
  userHealpers.verifyPayment(req.body).then(()=>{
    userHealpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("Payment successfull");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
}

// ----COUPON----//

async function applyCouponPost(req, res)  {
  let couponCode = req.body.coupon;
  console.log(couponCode);
  console.log("joooo")
  const currDate = new Date();

  let userCoupon = await couponHelpers.applyCoupon(couponCode);
  if(userCoupon && !req.session.usedCoupon){
    let endDate = new Date(userCoupon.expiryDate);
  if (endDate > currDate) {
    let total=req.session.user.pAmount;
    let response={}
    req.session.usedCoupon = userCoupon.couponCode;
    response.response=true;
    response.discountAmount= userCoupon.discount
    response.newTotal=(total - userCoupon.discount)
    req.session.user.pAmount=(total- userCoupon.discount)
    res.json(response);
  } else {
    res.json({ response: false });
  }
}else{
  res.json({ response: false });
}
}

//-------whish list-------//

async function userWhishlist(req,res){
  let userId=req.session.user._id
     let user = await userHealpers.getUser(userId)
    let list= await userHealpers.getWishlistProducts(userId)
    console.log(list);
   
   
    
    if(list && list.products.length>0){
  
     res.render('user/whishlist',{list,user})
    }
    else{
     req.session.cartEmpty = "Your cart is empty"
     let emptyError = req.session.cartEmpty
     res.render('user/whishlist',{user:req.session.user,emptyError})
}
  
}

function addWhishlist(req,res){
 
  userHealpers.addToWishlist(req.params.id,req.session.user._id).then(()=>{
   res.json({status:true})
  
  })

}

function removeWhishlist(req,res){
  
  userHealpers.removeFromwishlist(req.body).then((response)=>{
    res.json(response)
  })
}



async function returnOrder(req, res){
  let id = req.query.id;
  let status = req.query.st;
  let userId = req.session.user._id;
  userHealpers.cancelOrder(id, status);

  let order = await userHealpers.getOrder(id) 
  let amount = order.totalAmount
  userHealpers.addAmountWallet(amount,userId)

  res.redirect("/order-summery");
}

async function useWalletPost(req,res){
  
  let wallet=req.body.wallet;
  let Amount = req.session.user.pAmount
  let balance 
  let walletBalance 
  if(wallet > Amount){
    balance = 0;
    walletBalance = Math.abs(Amount-wallet);
  } else {
    balance = Math.abs(Amount-wallet);
    walletBalance = 0
  }
  req.session.user.pAmount = balance;
  req.session.user.walletBalance = walletBalance
  req.session.walletApply=true;

  let response={}
  response.total = balance;
  response.walletBalance = walletBalance
  res.json(response)

}

//------invoice----//



async function invoiceReport(req, res) {
  let id = req.query.id
  try {
   let order=await userHealpers.getOrder(id)
   console.log(order);
  
    const data = [
      
        order// Your invoice data here
    
      
    ];

    const doc = new PDFDocument();

    // Set the response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );

    // Create the table header
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Product ID", 2, 50);
    doc.text("Date", 150, 50);
    doc.text("Address", 250, 50);
    doc.text("Mobile Number", 350, 50);
    doc.text("Amount", 450, 50);
    doc.text("Pay Method", 540, 50);

    let y = 70;

    
 

    // Create the table rows
    doc.font("Helvetica").fontSize(20);
    doc.text("speXcart", 215, y + -65);
    doc.font("Helvetica").fontSize(10);



    data.forEach((order) => {
      doc.text(order.products[0].itemName, 2, y);
      doc.text(order.date.toLocaleDateString(), 150, y);
      doc.text(order.deliveryDetails.address, 250, y);
      doc.text(order.deliveryDetails.phone, 350, y);
      doc.text(order.totalAmount.toString(), 450, y);
      doc.text(order.paymentMethod, 550, y);

      y += 20;
    });

    let date = new Date();
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Total Amount:", 250, y + 20);
  doc.text(order.totalAmount, 350, y + 20);
  doc.text("Date:", 250, y + 80);
  doc.text(date, 350, y + 80);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // End the document
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating the invoice.");
  }
}

//-----forgot password------//

function forgotGet(req, res)  {
  res.render("user/forgot-p", {
    userF: req.session.userForgot,
  });

  req.session.userForgot = false;
}

async function enterOtp (req, res)  {
  // const { email, password, Cpassword } = req.body;
  console.log(req.body);
  
 
  req.session.enterEmail = req.body.Email;

  let userExist = await userHealpers.mailCheck(req.body.Email);

  if (userExist != 1) {
    req.session.EmailNot = true;
    res.redirect("/signup");
  } else {
    let Femail = req.body.Email;
    //
    let userDetails = req.body;
    console.log(userDetails);
   console.log('hello')

    

   
    // if (!otp) {
      
      otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });

     
      setTimeout(() => {
        otp = null;
      }, 60000);
    

    const mailOptions = {
      from: '"Fred Foo 👻" <granville44@ethereal.email>',
      to: Femail,
      subject: "OTP for sign up",
      text: `Your Resent OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        client.close();
        return;
      }
    });

   req.session.details=userDetails;
   

    // res.redirect('/forgot-otp',{userDetails,otp})
    res.render('user/forgot-otp')
  }


}

async function resetpswdPost (req, res){
  console.log(req.session.details);
  console.log(req.body);
  
 
  const { Email, Password, ConformPassword } = req.session.details;

    if (otp == null) {
      req.flash("You Entered a wrong OTP");
    }

    
    if (otp === req.body.fotp) {
          userHealpers
            .changePassword({
              Email: Email,
              Password: Password,
              ConformPassword: ConformPassword,
            })
            .then((response) => {
              if (response == 2) {
                req.session.pReset = true;
      
                res.redirect("/login");
                alert("password changed");
              } else {
                req.session.EmailNot = true;
                res.redirect("/signup");
              }
            });
        } else {
          res.redirect("/signup");
        }
  }

 

 



//---error page-----//

function errorGet(req,res){
  res.render('user/user-error');

}








  module.exports={home,viewCategory,loginGet,signGet,signPost,otpPost,resendOtpPost,loginPost,logoutGet,cartGet,addCartGet,changePdctQuantityPost,removePost,prodctdetaGet,allpdctGet,plcodrGet,plcodrPost,ordersucsGet,ordersmmryGet,useExist,addNewAddressPost,remvAddress,viewordrpdctGet,cancelOrder,deleteAddrs,userallpdctPost,userprofileGet,userprofilePost,edituserAddress,edituseraddressPost,deleteAddressGet,paymentresult,homePost,applyCouponPost,userWhishlist,addWhishlist,removeWhishlist,returnOrder,useWalletPost,invoiceReport,forgotGet,enterOtp,errorGet,resetpswdPost}