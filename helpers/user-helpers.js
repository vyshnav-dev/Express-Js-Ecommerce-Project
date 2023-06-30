const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const alert = require("alert");
const { response } = require("express");
const objectId = require("mongodb").ObjectId;
const Razorpay = require('razorpay');
const { log } = require("util");


      var instance = new Razorpay({
        key_id: 'rzp_test_jxUxz3C3ZEYxQJ',
        key_secret: 't3jYTnBEd2b7AhWDl0mi6sKE',
      });

module.exports = {
  // doSignup:(userData)=>{
  //     return new Promise(async(resolve,reject)=>{
  //         userData.password= await bcrypt.hash(userData.Password,10)
  //        db.get().collection(collection.USER_COLLECTION).insertOne(userData).
  //         resolve(data.insertedId)
  //     })

  // }

  // doSignup: (userData) => {
  //   return new Promise(async (resolve, reject) => {
  //     if (!userData.Password || userData.Password.trim() === '') {
  //       reject(new Error('Password field is required'));
  //       return;
  //     }

  //     try {
  //       userData.Password = await bcrypt.hash(userData.Password, 10);
  //       const data = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
  //       resolve(data);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  //   },

  // doSignup: (userData) => {
  //   return new Promise(async (resolve, reject) => {
  //     let userExist = await db
  //       .get()
  //       .collection(collection.USER_COLLECTION)
  //       .findOne({ Email: userData.Email });
  //     console.log(userExist);
  //     if (!userExist) {
  //       if (!userData.Password || userData.Password.trim() === "") {
  //         reject(new Error("Password field is required"));
  //         return;
  //       }

  //       try {
  //         userData.Password = await bcrypt.hash(userData.Password, 10);
  //        userData.date= new Date();
  //         const data = await db
  //           .get()
  //           .collection(collection.USER_COLLECTION)
  //           .insertOne(userData);
  //         resolve(data);
  //       } catch (err) {
  //         reject(err);
  //       }
  //     } else {
  //       resolve(1);
  //     }
  //   });
  // },
  doSignup: (userData) => {
        
    return new Promise(async (resolve, reject) => {
      let userExist=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
       if(userExist){
        resolve(1)
       }else{
        resolve(2)
       }


    });

  },



  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });

      if (user) {
        if (!user.isBlocked) {
          bcrypt.compare(userData.Password, user.Password).then((status) => {
            if (status) {
              console.log("login success");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("login failed");
              resolve({ status: false });
            }
          });
        } else {
          console.log("you are blocked");
          resolve(1);
        }
      } else {
        console.log("login faild 2");
        resolve({ status: false });
      }
    });
  },

  doMailVarify: (userEmail) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { Email: userEmail },
          { $set: { isBlocked: true } },
          (err, result) => {
            if (err) {
              console.log("error :" + err);
              res.status(500).send("Error blocking");
            } else {
              resolve();
            }
          }
        );
    });
  },

  doMailVarifySuccess: (userOtp) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { otp: userOtp.otp },
          { $set: { isBlocked: false } },
          (err, result) => {
            if (err) {
              console.log("error :" + err);
              res.status(500).send("Error blocking");
            } else {
              console.log("User Blocked");
              resolve("success");
              alert("Account successfully created");
            }
          }
        );
    });
  },

  doMailCheck: (userOtp) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let getOtp = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ otp: userOtp.otp });

      if (getOtp) {
        response.status = true;
        resolve(response);
      } else {
        response.status = false;
        resolve(response);
      }
    });
  },

  insertOtp: (userData, userotp) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { Email: userData.Email },
          { $set: { otp: userotp } },
          (err, result) => {
            if (err) {
              console.log("error :" + err);
              res.status(500).send("Error blocking");
            } else {
              console.log("otp set cheythu");
              resolve("success");
            }
          }
        );
    });
  },

  doSignUpSuccess: (Data) => {
    console.log(Data);
    return new Promise(async (resolve, reject) => {
      // try {
      //       Data.password = await bcrypt.hash(Data.password, 10);
      //       Data.cpassword = await bcrypt.hash(Data.Cpassword, 10);
      //       const data = await db.get().collection(collection.USER_COLLECTION).insertOne(Data);
      //       resolve(data);
      //     } catch (err) {
      //       reject(err);
      //     }
     
      Data.Password = await bcrypt.hash(Data.Password, 10);
      Data.ConformPassword = await bcrypt.hash(Data.ConformPassword, 10);
      Data.date= new Date();
      const data = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .insertOne(Data);
      resolve(data);
    });
  },
  addToCart: (prodId, userId) => {
    let proObj = {
      item: objectId(prodId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let pro=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)})
      proObj.itemName=pro.Name
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == prodId
        );
        console.log(proExist);
        if(proExist!=-1)
        {
          db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(prodId)},
          {
            $inc:{'products.$.quantity':1}
          }
          ).then(()=>{
            resolve()
          })
        }else{
        db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
        {

            $push:{products:proObj}

        }

        ).then((response)=>{
          resolve()
        })
      }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
         {
            $unwind:'$products'
         },
         {
              $project:{
                item:'$products.item',
                quantity:'$products.quantity'
              }
         },
         {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
         },
         {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            }
         }
        
        ])
        .toArray();
        console.log(cartItems);
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity:(details)=>{
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
    return new Promise((resolve,reject)=>{
      if(details.count==-1 && details.quantity==1){
        db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
        {
          $pull:{products:{item:objectId(details.product)}}
        }
        ).then((response)=>{
          resolve({removeProduct:true})
        })
      }else{
      db.get().collection(collection.CART_COLLECTION)
      .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
      {
        $inc:{'products.$.quantity':details.count}
      }
      ).then((response)=>{
        resolve({status:true})
      })
    }
    })
  },
  removeFromCart:(details)=>{
    details.quantity = parseInt(details.quantity)

    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CART_COLLECTION)
      .updateOne({_id:objectId(details.cart)},
      {
        $pull:{products:{item:objectId(details.product)}}
      }
      ).then((response)=>{
        resolve(true)
      })
    })
  },
  // getTotalAmount:(userId)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
  //       {
  //         $match:{user:objectId(userId)}
  //       },
  //       {
  //         $unwind:'$products'
  //       },{
  //         $project:{
  //           item:'$products.item',
  //           quantity:'$products.quantity' 
  //         }
  //       },{
  //         $lookup:{
  //           from:collection.PRODUCT_COLLECTION,
  //           localField:'item',
  //           foreignField:'_id',
  //           as:'product'
  //         }
  //       },
  //       {
  //         $project:{
  //           item:1,
  //           quantity:1,
  //           product:{$arrayElemAt:['$product',0]}
  //         }
  //       },
  //       {
  //         $project: {
  //           item: 1,
  //           quantity: 1,
  //           product: {
  //             $mergeObjects: [
  //               '$product',
  //               { Price: { $toInt: '$product.Price' } }
  //             ]
  //           }
  //         }
  //       },
  //       {
  //         $group:{
  //           _id:null,
  //           total:{$sum:{$multiply:['$quantity','$product.Price']}}
  //         }
  //       }
       
  //     ]).toArray()    
  //     resolve(total[0].total)
  //   })
  // },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
          // aggregation pipeline stages
  
          {
            $match:{user:objectId(userId)}
          },
          {
            $unwind:'$products'
          },{
            $project:{
              item:'$products.item',
              quantity:'$products.quantity' 
            }
          },{
            $lookup:{
              from:collection.PRODUCT_COLLECTION,
              localField:'item',
              foreignField:'_id',
              as:'product'
            }
          },
          {
            $project:{
              item:1,
              quantity:1,
              product:{$arrayElemAt:['$product',0]}
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: {
                $mergeObjects: [
                  '$product',
                  { Price: { $toInt: '$product.Price' } }
                ]
              }
            }
          },
          {
            $group:{
              _id:null,
              total:{$sum:{$multiply:['$quantity','$product.Price']}}
            }
          }
         
        ]).toArray()    
  
        if (total.length > 0 && total[0].total) {
          resolve(total[0].total);
        } else {
          resolve(0); // or any default value you want to set
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  placeOrder:(order,products,total)=>{
      return new Promise((resolve,reject)=>{
          console.log(order,products,total);
          let status=order['payment-method']==='COD'?'placed':'pending'
          let orderObj={
            deliveryDetails:{
              name:order.firstname,
              phone:order.phone,
              address:order.address,
              pincode:order.pincode
            },
            userId:objectId(order.userId),
            paymentMethod:order['payment-method'],
            products:products,
            totalAmount:total,
            status:status,
            date:new Date()
          }
          
          db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
            console.log("order id:",response.insertedId);
            resolve(response.insertedId)
          })
      })
  },
  getCartProductList:(userId)=>{
    return new Promise (async(resolve,reject)=>{
      let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
      console.log(cart.products);
      resolve(cart.products)


    })
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userId);
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find({ userId: objectId(userId) })
          .sort({ _id: -1 }) // Sort by descending order of _id (assumed to be the order creation timestamp)
          .toArray();
        console.log(orders);
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  userAddresses:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let existAddress = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
      resolve(existAddress)
    })
  },
  // addNewAddress:(userId,address)=>{
  //   return new Promise( async (resolve,reject)=>{
  //     let isAdress = await db.get().collection(collection.USER_COLLECTION).aggregate([{$match:{userId}},{$group:{_id:"$addresses"}}])
      
  //     if(isAdress){
  //       db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$push:{addresses:address}})
  //       resolve()
  //     } else {
  //       db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{addresses:[address]}})
  //       resolve()
  //     }
    
  //   })
  // },
  // removeAddress:(userId,address)=>{
  //   return new Promise( async (resolve,reject)=>{
  //     let isAdress = await db.get().collection(collection.USER_COLLECTION).aggregate([{$match:{userId}},{$group:{_id:"$addresses"}}])
      
  //     if(isAdress){
  //       db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$pull:{addresses:address}}).then((response)=>{
  //         resolve(true)
  //       })
        
        
        
  //     } 
    
  //   })
  // }
  getOrderProducts:(orderId)=>{
    return new Promise(async (resolve, reject) => {
      let orderIteams = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
         {
            $unwind:'$products'
         },
         {
              $project:{
                item:'$products.item',
                quantity:'$products.quantity'
              }
         },
         {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
         },
         {
            $project:{
                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}

            }
         }
        
        ])
        .toArray();
        console.log(orderIteams);
        resolve(orderIteams)
     
    });
  },
  // cancelOrder:(orderId,status)=>{
  //   new Promise(async (resolve, reject) => {
  //    await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { 'status': status } })
  //    resolve()
  //  })
  // },

  addNewAddress:(userId,address)=>{  
    return new Promise(async (resolve, reject) => {
      const userAddressCollection = db.get().collection(collection.USER_ADDRESS_COLLECTION);
      const userAddress = {
        userId: userId,
        address: address
      };
      await userAddressCollection.insertOne(userAddress)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
        
     })
  },
  getUserAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      const addresses=await db.get().collection(collection.USER_ADDRESS_COLLECTION).find({userId:userId}).toArray();
     
      if(addresses){
       resolve(addresses)
      }else{
        resolve('empty')
      }
    })
  },
  getOneAddress:(id)=>{
    return new Promise(async(resolve,reject)=>{
      const address = await db.get().collection(collection.USER_ADDRESS_COLLECTION).findOne({_id:objectId(id)})
    
      if(address){
       resolve(address)
      }else{
        resolve('empty')
      }
    })
  },
  editAddress: (Id,address) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.get().collection(collection.USER_ADDRESS_COLLECTION).updateOne(
          { _id: objectId(Id) },
          {
            $set: {
              address
            }
          },
          { upsert: false }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  
  deleteAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
       db.get().collection(collection.USER_ADDRESS_COLLECTION).deleteOne({_id:objectId(userId)}).then((response)=>{
        resolve({removeAddress:true})
      })
    })
  },


  cancelOrder: (orderId,status) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne(
        { _id: objectId(orderId) },
        { $set: { 'status': status } },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  getOrder: (id) => {
    return new Promise(async (resolve) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(order);
    });
  },

  addAmountWallet: (amount, userId) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne({ _id: objectId(userId) }, { $inc: { walletAmount: amount } });
  },

  decrementAmountWallet: (amount, userId) => {
    db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne({ _id: objectId(userId) }, { $set: { walletAmount: amount } });
  },
  
  searchProducts:(search)=>{
    return new Promise(async (resolve,reject)=>{
      let products = await db.get().collection(collection.PRODUCT_COLLECTION)
      .find(   {$or: [
        // { Category: { $regex: new RegExp('^' + search + '.*', 'i') } },
        { Name: { $regex: new RegExp('^' + search + '.*', 'i') } },
        { Price: { $regex: new RegExp('^' + search + '.*', 'i') } },
        // Add more fields as needed
      ]})
      .toArray()
      if(products.length){
        resolve(products)
        console.log(products)
      } else {
        let sErr = "No such item found" 
        reject(sErr)
      }
     
    })
  },
  generateRazorpay:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
      

     var options={
        amount: total*100,
        currency: "INR",
        receipt: ""+orderId,
        
        };
        instance.orders.create(options,function(err,order){
          if(err){
            console.log(err);
          }else{
            console.log("new order:",order);
            resolve(order)
          }
          
      });
      
    })
  },
  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
      const crypto=require('crypto');
      let hmac=crypto.createHmac('sha256','t3jYTnBEd2b7AhWDl0mi6sKE')

      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
      if(hmac==details['payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }
    })
  },
  changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
      {
        $set:{
          status:'placed'
        }
      }
      ).then(()=>{
        resolve()
      })
    })
  },
  totalUser:()=>{
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTION).countDocuments({}, (err, count) => {
        if (err) {
          reject(err);
        }
        // Access the total count of products
        resolve(count);
      });
      
    })
  },
  
 isBlocked:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let result=await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId)}).toArray()
   resolve(result.isBlocked)
  })
 },

 //----coupen section -----//

 //coupon management //
 addCouponUser:(userId,coupon)=>{
  return new Promise(async(resolve,reject)=>{
     db.get().collection(collection.USER_COLLECTION).updateOne(
      { _id: objectId(userId) },
      { $push: { couponCodes: coupon } }
    ).then(()=>{
      resolve()
    })

    })
 },

 deleteCoupon: (userId, usedCoupon) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userCollection = await db.get()
      .collection(collection.USER_COLLECTION)
      .updateOne(
        { _id: objectId(userId), "couponCodes.coupon": usedCoupon },
        { $inc: { "couponCodes.$.count": -1 } }
      );

      resolve(userCollection);
    } catch (error) {
      reject(error);
    }
  });
},

 getUser:(userId)=>{
  return new Promise(async(resolve,reject)=>{
   let user= await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
   resolve(user)
  })
 },

 addCouponUser: (userId, coupon) => {
  return new Promise(async (resolve, reject) => {
    let coupons = await db.get().collection(collection.USER_COLLECTION)
    .aggregate([
      { $match: { _id: objectId (userId) } },
      { $unwind: "$couponCodes" },
      { $match: { "couponCodes.coupon": coupon } },
    ]).toArray();
    console.log(coupons.length);
    if (coupons.length) {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId), "couponCodes.coupon": coupon },
          { $inc: { "couponCodes.$.count": 1 } }
        );
    } else {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          { $push: { couponCodes: { coupon, count: 1 } } }
        )
        .then(() => {
          resolve();
        });
    }
  });
},


// addToWishlist: (prodId, userId) => {
//   return new Promise(async (resolve, reject) => {
//     let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: objectId(prodId) }).toArray();

//     db.get().collection(collection.WISHLIST_COLLECTION).insertOne({ product, userid: userId })
//       .then(() => {
//         resolve();
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// },
addToWishlist: (prodId, userId) => {
  let prooObj = {
    item: objectId(prodId),
   
  }
  return new Promise(async (resolve, reject) => {
    let pro=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)})
    
    prooObj.itemName=pro.Name
    prooObj.itemPrice=pro.Price
    prooObj.itemphotos=pro.photos

    let userWishlist = await db
      .get()
      .collection(collection.WISHLIST_COLLECTION)
      .findOne({ user: objectId(userId) });
      if (userWishlist) {
         db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
        {

            $addToSet:{products:prooObj}

        }
        ).then((response)=>{
          resolve()
        })
       
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [prooObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
        }
      })
    },

    getWishlistProducts: (userId) => {
      return new Promise(async (resolve, reject) => {
        let wishlistItems = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({user:objectId(userId)})
          
          console.log(wishlistItems);
          console.log('uoooo');
        resolve(wishlistItems);
      });
    },

removeFromwishlist:(details)=>{
 console.log(details); 
console.log('hiii');
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.WISHLIST_COLLECTION)
    .updateOne({_id:objectId(details.id)},
    {
      $pull:{products:{item:objectId(details.product)}}
    }
    ).then((response)=>{
      resolve(true)
    })
  })
},
ordersummeryPagination:(val)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(val)
    let productse = await db.get()
    .collection(collection.ORDER_COLLECTION)
    .find()
    .sort({_id:-1})
    .skip((val - 1)*9)
    .limit(9)
    .toArray()
    resolve(productse)
  })
},

searchOrders:(search)=>{
  return new Promise(async (resolve,reject)=>{
    let products = await db.get().collection(collection.ORDER_COLLECTION)
    .find(   {$or: [
       { status: { $regex: new RegExp('^' + search + '.*', 'i') } },
      { paymentMethod: { $regex: new RegExp('^' + search + '.*', 'i') } },
      { totalAmount: { $regex: new RegExp('^' + search + '.*', 'i') } },
      // Add more fields as needed
    ]})
    .toArray()
    if(products.length){
      resolve(products)
      console.log(products)
    } else {
      let sErr = "No such item found" 
      reject(sErr)
    }
   
  })
},

mailCheck:async (Email)=>{
  try {
    return await new Promise(async (resolve, reject) => {
      let emailExist = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: Email })
  
      if (emailExist) {
        resolve(1)
      } else {
        resolve(2)
      }
    })
  } catch (error) {
    reject(error) // Reject the promise with the error
  }

},

changePassword:(user)=>{
  console.log(user.email)
  return new Promise(async(resolve,reject)=>{
    let userExist=await db.get().collection(collection.USER_COLLECTION).findOne({Email:user.Email})
    if(userExist){
      user.Password = await bcrypt.hash(user.Password, 10); 
      user.ConformPassword = await bcrypt.hash(user.ConformPassword, 10);
     await db.get().collection(collection.USER_COLLECTION).updateOne({Email:user.Email},{$set:{
      Password:user.Password,
      ConformPassword:user.ConformPassword

     }})
     resolve(2)
    }else{
      resolve(1)
    }
  })
},


//-----user profile change password-----//



}


