const fileUpload = require("express-fileupload");
const productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const cateHelpers = require("../helpers/cate-helpers");
const userHealpers = require("../helpers/user-helpers");
const couponHelpers=require("../helpers/coupon-helpers")

const PDFDocument = require("pdfkit");
const multer=require('multer')
const sharp=require('sharp')
const upload = multer({ dest:'public/images'});
const path = require("path");
const fs =require('fs');

function home(req, res, next) {
  let admin = req.session.admin;
  let val = Number(req.query.p);
  console.log(val);
  productHelpers.getAllProductsPagination(val).then((products) => {
    console.log(products);
    res.render("admin/view-products", { admin: true, products });
  });
}

function adminhomePost(req, res, next) {
  const admin = req.session.admin;
  let searchq = String(req.body.search);
  productHelpers
    .searchProducts(searchq)
    .then((products) => {
      console.log(products);
      console.log("jooooo");
      res.render("admin/view-products", { products, admin });
    })
    .catch((err) => {
      console.log(err);
      res.render("admin/view-products", { err, admin });
    });
}

async function addpdGet(req, res) {
  let admin = req.session.admin;
  let category = await cateHelpers.getAllCategory();
  res.render("admin/add-product", { admin, category });
}



// -----new multer code------//




async function addpdPost(req, res) {
   console.log(req.files)
   req.body.Stock = parseInt(req.body.Stock);
  const{
    Name,
    Category,   
    Price,
    Stock,
    Description 
    
 } = req.body;
 console.log(req.body)

   const photos=req.files.map((file)=>{
      const oldPath = `${file.path}`;
      const newPath = `${file.path}.png`;
      if(fs.existsSync(oldPath)){
        fs.rename(oldPath,newPath,function(err){
          if(err)throw err;
          console.log('file renamed')
        })
      }else{
        console.log(('not renamed'));
      }
      return {
        // id:  path.basename(newPath),
        title: file.originalname,
        
         fileName: newPath.replace(/public/gi,"")
        //  filepath: file.path.replace(/views/gi,"")
      };
    })
    console.log(photos)
    
   
  productHelpers.addProduct({Name:Name,Category:Category,Price:Price,Stock:Stock,Description:Description,photos:photos}, (id) => {
 
    // req.session.admin.loggedIn=true
    res.redirect('/admin')
  
  })
};




async function editpdGet(req, res) {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  let admin = req.session.admin;
  let category = await cateHelpers.getAllCategory();
  res.render("admin/edit-product", { admin, product, category });
}









function editpdPost(req, res) {
  req.body.Stock = parseInt(req.body.Stock);
  const { Name, Category, Price,Stock, Description } = req.body;
  const photos = req.files.map((file) => {
    const oldPath = `${file.path}`;
    const newPath = `${file.path}.png`;
    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err;
      });
      return {
        id: path.basename(newPath),
        title: file.originalname,
        fileName: newPath.replace(/public/gi, ""),
      };
    } else {
      return null; // Return null for the file that was not uploaded
    }
  });

  productHelpers
    .getProductDetails(req.params.id) // Fetch the existing product
    .then((product) => {
      const existingPhotos = product.photos; // Get the existing photos

      // Replace the existing photo with the newly uploaded photo, if available
      const updatedPhotos = photos.length > 0 ? photos : existingPhotos;

      productHelpers
        .updateProduct(req.params.id, {
          Name: Name,
          Category: Category,
          Price: Price,
          Stock:Stock,
          Description: Description,
          photos: updatedPhotos,
        })
        .then(() => {
          res.redirect("/admin");
        });
    });
}


function hidepdGet(req, res) {
  let prodId = req.params.id;
  productHelpers.HideProduct(prodId).then(() => {
    res.redirect("/admin");
  });
}

function unhidepdGet(req, res) {
  let prodId = req.params.id;
  productHelpers.unHideProduct(prodId).then(() => {
    res.redirect("/admin");
  });
}

//-----------category----------

function categoryviewGet(req, res) {
  cateHelpers.getAllCategory().then((category) => {
    console.log(category);
    res.render("admin/view-category", { admin: true, category });
  });
}

function addcatGet(req, res) {
  res.render("admin/add-category", {
    admin: true,
    caError: req.session.caError,
  });
  req.session.caError = false;
}



//----multer add category----//

 function addcatPost(req, res) {

  
 const{
  
   Category,   
   
   
} = req.body;
console.log(req.body)
console.log(req.files);

  const photos=req.files.map((file)=>{
     const oldPath = `${file.path}`;
     const newPath = `${file.path}.png`;
     if(fs.existsSync(oldPath)){
       fs.rename(oldPath,newPath,function(err){
         if(err)throw err;
        //  console.log('file renamed')
       })
     }else{
       console.log(('not renamed'));
     }
     return {
       // id:  path.basename(newPath),
       title: file.originalname,
       
        fileName: newPath.replace(/public/gi,"")
       //  filepath: file.path.replace(/views/gi,"")
     };
   })
   console.log(photos)
   
  
 cateHelpers.addCategory({Category:Category,photos:photos}).then((data)=>{
  if(data)
  { 
    res.redirect('/admin/view-category');
  }
  else{
    req.session.caError = "Category Already Exist";
    res.redirect('/admin/add-category')
  }
  
 }) 

 
   
 

};


async function editcatGet(req, res) {
  let category = await cateHelpers.getCategoryDetails(req.params.id);
  console.log(category);
  res.render("admin/edit-category", {
    category,
    admin: true,
    caError: req.session.caError,
  });
  req.session.caError = false;
}


  function editcatPost(req, res) {
    const { Category } = req.body;
    const photos = req.files.map((file) => {
      const oldPath = `${file.path}`;
      const newPath = `${file.path}.png`;
      if (fs.existsSync(oldPath)) {
        fs.rename(oldPath, newPath, function (err) {
          if (err) throw err;
        });
        return {
          id: path.basename(newPath),
          title: file.originalname,
          fileName: newPath.replace(/public/gi, ""),
        };
      } else {
        return null; // Return null for the file that was not uploaded
      }
    });
  
    cateHelpers
      .getCategoryDetails(req.params.id) // Fetch the existing category
      .then((category) => {
        const existingPhotos = category.photos; // Get the existing photos
  
        // Replace the existing photos with the newly uploaded photos, if available
        const updatedPhotos = photos.length > 0 ? photos : existingPhotos;
  
        cateHelpers
          .updateCategory(req.params.id, {
            Category: Category,
            photos: updatedPhotos,
          })
          .then(() => {
            res.redirect("/admin/view-category");
          });
      });
  }


  
  
function hidecatGet(req, res) {
  let cateId = req.params.id;
  cateHelpers.HideCategory(cateId).then(() => {
    res.redirect("/admin/view-category");
  });
}

function unhidecatGet(req, res) {
  let cateId = req.params.id;
  cateHelpers.unHideCategory(cateId).then(() => {
    res.redirect("/admin/view-category");
  });
}

async function dashGet(req, res) {
  let latestorder = await adminHelpers.getAllLatestOrders();
  let latestuser = await adminHelpers.getAllLatestUsers();
  let totaluser = await adminHelpers.totalUser();
  let totalproduct = await adminHelpers.totalProduct();
  let totalAmount = await adminHelpers.totalAmount();
  let monthlydata = await adminHelpers.getSellingProductInEachMonth();
  let paymentCounts = await adminHelpers. paymentMethodCount();

  res.render("admin/dashbord", {
    admin: true,
    latestorder,
    latestuser,
    totaluser,
    totalproduct,
    totalAmount,
    monthlydata,
    paymentCounts
  });
}

function adlogGet(req, res) {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", { loginErr: req.session.adminLoginErr });
    req.session.adminLoginErr = false;
  }
}

function adlogPost(req, res) {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log("Admin is successfully loged in ");
      req.session.admin = response.admin;
      req.session.admin.loggedIn = true;
      res.redirect("/admin/dashbord");
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect("/admin/adminLogin");
    }
  });
}

function adlgoutGet(req, res) {
  //req.session.admin=null
  req.session.destroy();
  res.redirect("/");
}

async function adusrGet(req, res) {
  let admin = req.session.admin;
  let val = Number(req.query.p);
  console.log(val);
  adminHelpers.getuserPagination(val).then((users) => {
   
    res.render("admin/all-users", { admin: true, users });
  });
  
  
}

function adusrPost(req,res){
  const admin = req.session.admin;
  let searchq = String(req.body.search);
  adminHelpers
    .searchUser(searchq)
    .then((users) => {
      
      console.log("jooooo");
      res.render("admin/all-users", { users, admin });
    })
    .catch((err) => {
      console.log(err);
      res.render("admin/all-users", { err, admin });
    });
}

function adblkGet(req, res) {
  let userId = req.params.id;
  adminHelpers.blockUser(userId).then(() => {
    res.redirect("/admin/user-data");
  });
}

function adunblkGet(req, res) {
  let userId = req.params.id;
  adminHelpers.unBlockUser(userId).then(() => {
    res.redirect("/admin/user-data");
  });
}

 function usrorder(req, res) {
  let admin = req.session.admin;
  let val = Number(req.query.p);
  console.log(val);
 adminHelpers.getAlluserorderPagination(val).then((usersOrders) => {
    
    res.render("admin/user-order", { admin: true, usersOrders});
  });
  
}

function userorderPost(req,res){
 const admin = req.session.admin;
  let searchq = String(req.body.search);
  adminHelpers
    .searchOrders(searchq)
    .then((usersOrders) => {
      
      console.log("jooooo");
      res.render("admin/user-order", { usersOrders, admin });
    })
    .catch((err) => {
      console.log(err);
      res.render("admin/user-order", { err, admin });
    });

}


async function statuschange(req, res) {
  let id = req.query.id;
  let status = req.query.st;
  adminHelpers.cancelOrder(id, status);
  res.redirect("/admin/user-order");
}

async function admnviewordrpdctGet(req, res) {
  let products = await adminHelpers.getOrderProducts(req.params.id);
  res.render("admin/order-product", { products });
}

//---------salse report-------//
async function salereport(req, res) {
  let totalPricesevenday = await adminHelpers.getAmountLastSevenDay();
  
  let totalPricemonth = await adminHelpers.getAmountLastMonth();
  let totalPriceyear = await adminHelpers.getAmountLastYear();

  let totalQuatitysevenday = await adminHelpers.getTotalProductQuantityLastSevenDays();
  let totalQuatitymonth = await adminHelpers.getTotalProductQuantityLastMonth();
  let totalQuatityyear = await adminHelpers.getTotalProductQuantityLastYear();

  let totalOrdersevenday = await adminHelpers.getOrderLastSevenDay();
  
  let totalOrdermonth = await adminHelpers.getOrderLastMonth();
  
  let totalOrderyear = await adminHelpers.getOrderLastYear();

  let totalUsersevenday = await adminHelpers.getUserInLastSevenDay();
  let totalUsermonth = await adminHelpers.getUserInLastMonth();
  let totalUseryear = await adminHelpers.getUserInLastYear();

  let totalAmounts = await adminHelpers.totalsaleAmount();
  let totalAmount = totalAmounts.totalAmount;
  let totalOrder = totalAmounts.totalOrders;
  let totalCustomer = await userHealpers.totalUser();

  const data = [
    {
      days: "A week",
      sales: totalPricesevenday,
      orders: totalOrdersevenday,
      products: totalQuatitysevenday,
      customers: totalUsersevenday,
    },
    {
      days: "A month",
      sales: totalPricemonth,
      orders: totalOrdermonth,
      products: totalQuatitymonth,
      customers: totalUsermonth,
    },
    {
      days: "A year",
      sales: totalPriceyear,
      orders: totalOrderyear,
      products: totalQuatityyear,
      customers: totalUseryear,
    },
  ];

  const doc = new PDFDocument();

  // Set the response headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");

  // Create the table header
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Days", 50, 50);
  doc.text("Sales (rupees)", 150, 50);
  doc.text("Orders", 250, 50);
  doc.text("Products", 350, 50);
  // doc.text("Customers", 450, 50);
  let y = 70;
  // Create the table rows
  doc.font("Helvetica").fontSize(20);
  doc.text("speXcart", 210, y + -55);
  doc.font("Helvetica").fontSize(10);

  data.forEach((row) => {
    doc.text(row.days, 50, y);
    doc.text(row.sales.toString(), 150, y);
    doc.text(row.orders.toString(), 250, y);
    doc.text(row.products.toString(), 350, y);
    // doc.text(row.customers.toString(), 450, y);
    y += 20;
  });

  let date = new Date();
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Total Income:", 250, y + 20);
  doc.text(totalAmount, 350, y + 20);
  doc.text("Total Orders:", 250, y + 40);
  doc.text(totalOrder, 350, y + 40);
  // doc.text("Total Customers:", 250, y + 60);
  // doc.text(totalCustomer, 350, y + 60);
  doc.text("Date:", 250, y + 80);
  doc.text(date, 350, y + 80);

  // Pipe the PDF document to the response
  doc.pipe(res);

  // End the document
  doc.end();
}





// ------coupon section------//

 function viewCouponGet (req, res)  {
  let admin = req.session.admin
  couponHelpers.getCoupons().then((response) => {
    res.render("admin/view-coupon", { response,admin });
  });
}

function addCouponGet(req, res)  {
  let admin = req.session.admin
  res.render("admin/add-coupon",{admin:true});
}

function addCouponPost (req, res)  {

  req.body.couponCode = req.body.couponCode.toUpperCase()
  req.body.discount = parseInt(req.body.discount)
  req.body.maxPurchase = parseInt(req.body.maxPurchase)

  couponHelpers.addcoupon(req.body).then((response) => {
    res.json({ response });
  });
}
function editCouponGet(req,res){
  let id = req.params.id;
  
  couponHelpers.getOneCoupon(id).then((coupon)=>{
   
    res.render('admin/edit-coupon',{coupon,admin:true})
  })
}
function editCouponPost(req,res){
  let couponCode = req.body.couponCode.toUpperCase()
  let discount = parseInt(req.body.discount)
  let maxPurchase = parseInt(req.body.maxPurchase)
  let id = req.body.id

  let data = {
    couponCode: couponCode,
    expiryDate: req.body.expiryDate,
    discount: discount,
    maxPurchase: maxPurchase
  }
  couponHelpers.editCoupon(id,data).then((response) => {
    res.json({ response });
  });
}
function deleteCouponPost(req,res){
  let id = req.body.id
  console.log(req.body)
  couponHelpers.deleteCoupon(id).then((response)=>{
    res.json({response})
  })
}


//-------banner section----//

// banner maangement  start//
async function bannerGet (req, res)  {
  let banners = await adminHelpers.getBanners();
  
  res.render('admin/banner', { admin: true, banners });
}

function addBannerGet(req, res){
  res.render('admin/add-banner',{admin:true});
}

function addBannerPost  (req, res) {
  upload.array('Image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      console.log(err);
      res.redirect('/admin/addBanner');
    } else if (err) {
      // An unknown error occurred during file upload
      console.log(err);
      res.redirect('/admin/addBanner');
    } else {
      if (!req.files || req.files.length === 0) {
        // Image file is not selected
        console.log('No image selected');
        res.redirect('/admin/addBanner');
        return;
      }

      const photos = req.files.map((file) => {
        const oldPath = file.path;
        const newPath = `${file.path}.png`;
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          console.log('File renamed');
        } else {
          console.log('File not renamed');
        }
        return {
          title: file.originalname,
          fileName: newPath.replace(/public/gi, ''),
        };
      });

      try {
        const insertedId = await adminHelpers.addBanner({ photos: photos });
        req.session.admin.loggedIn = true;
        res.redirect('/admin/banner');
      } catch (error) {
        console.log(error);
        res.redirect('/admin/addBanner');
      }
    }
  });
};




function deleteBannerGet(req, res) {
  let bannerId = req.params.id;
  adminHelpers.deleteBanner(bannerId).then((response) => {
    res.redirect('/admin/banner');
  });
}
// banner mangement end//


//-----new sale report----//

async function saleReportGet(req,res)  {
  console.log("hiii");
  filter = req.query.range;
  let sales
  let range
  if(filter == "week"){
    sales = await adminHelpers.orderLastWeek()
    sales.forEach((sale) => {
      const dateParts =sale.date.toISOString().substring(0, 10).split("-");
      sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    });
    
    range = "Week"
  } else if(filter == "month"){
    sales = await adminHelpers.orderLastMonth()
    sales.forEach((sale) => {
      const dateParts =sale.date.toISOString().substring(0, 10).split("-");
      sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    });
    range = "Month"
  } else {
    sales = await adminHelpers.orderLastYear()
    sales.forEach((sale) => {
      const dateParts =sale.date.toISOString().substring(0, 10).split("-");
      sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    });
    range = "Year"
  }
  res.render("admin/sales-report", { admin: true, sales,range});

}


async function dateFilterPost  (req,res) {
  let startDate = req.body.startDate
  let endDate = req.body.endDate
  startDate = new Date(startDate);
  endDate = new Date(endDate)
 

  let sales = await adminHelpers.orderInDate(startDate,endDate)
  sales.forEach((sale) => {
    const dateParts =sale.date.toISOString().substring(0, 10).split("-");
    sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  });
 
  res.render("admin/sales-report", { admin: true,sales});
 }


module.exports = {
  home,
  addpdGet,
  addpdPost,
  editpdGet,
  editpdPost,
  hidepdGet,
  unhidepdGet,
  categoryviewGet,
  addcatGet,
  addcatPost,
  editcatGet,
  editcatPost,
  hidecatGet,
  unhidecatGet,
  dashGet,
  adlogGet,
  adlogPost,
  adlgoutGet,
  adusrGet,
  adblkGet,
  adunblkGet,
  usrorder,
  statuschange,
  adminhomePost,
  admnviewordrpdctGet,
  salereport,
  viewCouponGet,
  addCouponGet,
  addCouponPost,
  editCouponGet,
  editCouponPost,
  deleteCouponPost,
  bannerGet,
  addBannerGet,
  addBannerPost,
  deleteBannerGet,
  userorderPost,
  adusrPost,
  saleReportGet,
  dateFilterPost

};
