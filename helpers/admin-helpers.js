const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const objectId=require("mongodb").ObjectId;
const { ObjectId } = require("mongodb");
// const { use } = require('../routes/admin')
const moment=require('moment')

module.exports={
    
        doLogin:(adminData)=>{
          return new Promise(async(resolve,reject)=>{
            let loginStatus=false;
            let response={} 
            console.log(adminData);
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            console.log(admin);
            if(admin){
              bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                if(status){
                  console.log("login success");
                  response.admin=admin
                  response.status=true
                  resolve(response)
                }else{
                  console.log("login failed");
                  resolve({status:false})
                }
              })
            
            }else{
              console.log("login failed");
              resolve({status:false})
            }
          })
        },
        getAllUsers:(user)=>{
            return new Promise(async(resolve,reject)=>{
                let users=await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
                resolve(users)
            })
        },
        blockUser:(userId)=>{
          return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{isBlocked:true}},(err,res)=>{
              if(err){
                console.log("error :"+err)
                res.status(500).send("Error blocking")
            }else{
                console.log('User Blocked')
                resolve("success")
            }
            })
          })
        },
        unBlockUser:(userId)=>{
          return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{isBlocked:false}},(err,res)=>{
              if(err){
                console.log("error :"+err)
                res.status(500).send("Error blocking")
            }else{
                console.log('User Unblocked')
                resolve("success")
            }
            })
          })
        },
        getAllUsersOrders: () => {
          return new Promise(async (resolve, reject) => {
            let usersOrders = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .find({})
              .sort({ _id: -1 }) // Sort by _id field in descending order
              .toArray();
        
            resolve(usersOrders);
          });
        },
      
        delivered:async (orderId)=>{
          await new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { 'status': 'Delivered' } })
          })
          resolve()
        },
        cancelOrder:(orderId,status)=>{
          new Promise(async (resolve, reject) => {
           await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { 'status': status } })
           resolve()
         })
        },
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
        getAllLatestOrders: () => {
          return new Promise(async (resolve, reject) => {
            let usersOrders = await db
              .get()
              .collection(collection.ORDER_COLLECTION)
              .find({})
              .sort({ _id: -1 }) // Sort by descending order of _id (assuming _id represents the order creation timestamp)
              .limit(5) // Limit the result to 5 documents
              .toArray();
        
            resolve(usersOrders);
          });
        },

        getAllLatestUsers: () => {
          return new Promise(async (resolve, reject) => {
            let users = await db
              .get()
              .collection(collection.USER_COLLECTION)
              .find({})
              .sort({ _id: -1 }) // Sort by descending order of _id (assuming _id represents the user creation timestamp)
              .limit(5) // Limit the result to 5 documents
              .toArray();
        
            resolve(users);
          });
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

        totalProduct:()=>{
          return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({}, (err, count) => {
              if (err) {
                reject(err);
              }
              // Access the total count of products
              resolve(count);
            });
            
          })
        },

        totalAmount:()=>{
          return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $group: {
                  _id: null,
                  totalAmount: { $sum: "$totalAmount" },
                  totalOrders: { $sum: 1 }
                }
              }
            ]).toArray((err, result) => {
              if (err) {
                reject(err);
              }
              // Access the total amount and total orders from the result
              const totalAmount = result[0].totalAmount;
              const totalOrders = result[0].totalOrders;
              resolve({ totalAmount, totalOrders });
            });
          
    })
  },
  
  
  getSellingProductInEachMonth: () => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $group: {
            _id: { $month: { $toDate: "$date" } },
            totalAmount: { $sum: "$totalAmount" }
          }
        },
        {
          $sort:{"_id":1}
        }
      ]).toArray((err, result) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
  
        const totalAmounts = result.map(item => item.totalAmount);
        resolve(totalAmounts);
      });
    });
  },

  paymentMethodCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const codCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({ paymentMethod: "COD" });
  
        const onlineCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({ paymentMethod: "ONLINE" });
  
        resolve({ codCount, onlineCount });
      } catch (error) {
        reject(error);
      }
    });
  },
  //---------sles roport------//


  getAmountLastSevenDay: () => {
    return new Promise(async (resolve, reject) => {
      const sevenDaysAgo = moment().subtract(7, 'days').toDate();
  
      try {
        const totalPrize = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              date: {
                $gte: sevenDaysAgo
              },
              status: "Delivered"
            }
          },
          {
            $group: {
              _id: null,
              totalPrize: {
                $sum: "$totalAmount"
              }
            }
          }
        ]).toArray();
        console.log(totalPrize);
        
        
  
        if (totalPrize.length > 0) {
          resolve(totalPrize[0].totalPrize);
        } else {
          resolve(0); // No orders found in the last seven days
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  
  getAmountLastMonth: () => {
    return new Promise(async (resolve, reject) => {
      const sevenDaysAgo = moment().subtract(30, 'days').toDate();
  
      let totalPrize = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: sevenDaysAgo
            },
            status: "Delivered"
          }
        },
        {
          $group: {
            _id: null,
            totalPrize: {
              $sum: "$totalAmount"
            }
          }
        }
      ]).toArray();
      console.log(totalPrize)
      resolve(totalPrize[0].totalPrize);
    });
  },
  getAmountLastYear: () => {
    return new Promise(async (resolve, reject) => {
      const sevenDaysAgo = moment().subtract(360, 'days').toDate();
  
      let totalPrize = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: sevenDaysAgo
            },
            status: "Delivered"
          }
        },
        {
          $group: {
            _id: null,
            totalPrize: {
              $sum: "$totalAmount"
            }
          }
        }
      ]).toArray();
      console.log(totalPrize)
      resolve(totalPrize[0].totalPrize);
    });
  },
  getTotalProductQuantityLastSevenDays:() => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(7, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();
  
      try {
        const result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              date: {
                $gte: startDate,
                $lte: endDate
              },
              status: "Delivered"
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: { $sum: "$products.quantity" } }
            }
          }
          
        ]).toArray();
  
        // Extract the total quantity from the result
        const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
        console.log(totalQuantity)
        console.log('totalQuantity')
      
        resolve(totalQuantity);
      } catch (error) {
        reject(error);
      }
    });
  },
  getTotalProductQuantityLastMonth:() => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(30, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();
  
      try {
        const result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              date: {
                $gte: startDate,
                $lte: endDate
              },
              status: "Delivered"
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: { $sum: "$products.quantity" } }
            }
          }
        ]).toArray();
  
        // Extract the total quantity from the result
        const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
        console.log(totalQuantity)
        console.log('totalQuantity')
        resolve(totalQuantity);
      } catch (error) {
        reject(error);
      }
    });
  },
  getTotalProductQuantityLastYear:() => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(360, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();
  
      try {
        const result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              date: {
                $gte: startDate,
                $lte: endDate
              },
              status: "Delivered"
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: { $sum: "$products.quantity" } }
            }
          }
        ]).toArray();
  
        // Extract the total quantity from the result
        const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
        console.log(totalQuantity)
        
        resolve(totalQuantity);
      } catch (error) {
        reject(error);
      }
    });
  },

 

  getOrderLastSevenDay: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(7, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();
  
      try {
        const orders = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
          date: {
            $gte: startDate,
            $lte: endDate
          },
          status: "Delivered"
        })
        console.log(orders);
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  getOrderLastMonth:()=>{
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(30, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();
  
      try {
        const orderCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
          date: {
            $gte: startDate,
            $lte: endDate
          },
          status: "Delivered"
        });
        console.log(orderCount)
        console.log('orderCount')
        resolve(orderCount);
      } catch (error) {
        reject(error);
      }
    });
  },
  getOrderLastYear:()=>{
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(360, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();
  
      try {
        const orderCount = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
          date: {
            $gte: startDate,
            $lte: endDate
          },
          status: "Delivered"
        });
        console.log(orderCount)
        console.log('orderCount')
        resolve(orderCount);
      } catch (error) {
        reject(error);
      }
    });
  
  },
  getUserInLastSevenDay:()=>{
    return new Promise(async(resolve,reject)=>{
      const sevenDaysAgo = moment().subtract(7, 'days').toDate();
      db.get().collection(collection.USER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: sevenDaysAgo
            }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]).toArray()
        .then((result) => {
          const userCount = result.length > 0 ? result[0].count : 0;
         
          resolve(userCount)
        })
        .catch((error) => {
          console.log('Error:', error);
        });
    })
  },
  getUserInLastMonth:()=>{
    return new Promise(async(resolve,reject)=>{
      const sevenDaysAgo = moment().subtract(30, 'days').toDate();
      db.get().collection(collection.USER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: sevenDaysAgo
            }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]).toArray()
        .then((result) => {
          const userCount = result.length > 0 ? result[0].count : 0;
         
          resolve(userCount)
        })
        .catch((error) => {
          console.log('Error:', error);
        });
    })
  },
  getUserInLastYear:()=>{
    return new Promise(async(resolve,reject)=>{
      const sevenDaysAgo = moment().subtract(360, 'days').toDate();
      db.get().collection(collection.USER_COLLECTION).aggregate([
        {
          $match: {
            date: {
              $gte: sevenDaysAgo
            }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]).toArray()
        .then((result) => {
          const userCount = result.length > 0 ? result[0].count : 0;
         
          resolve(userCount)
        })
        .catch((error) => {
          console.log('Error:', error);
        });
    })
  },
  totalAmount:()=>{
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).aggregate([
        
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 }
          }
        }
      ]).toArray((err, result) => {
        if (err) {
          reject(err);
        }
        // Access the total amount and total orders from the result
        const totalAmount = result[0].totalAmount;
        const totalOrders = result[0].totalOrders;
        resolve({ totalAmount, totalOrders });
      });
      
  })
},

totalsaleAmount:()=>{
  return new Promise(async(resolve,reject)=>{
    db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match: {
          status: "Delivered"
        }
      },
      
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]).toArray((err, result) => {
      if (err) {
        reject(err);
      }
      // Access the total amount and total orders from the result
      const totalAmount = result[0].totalAmount;
      const totalOrders = result[0].totalOrders;
      resolve({ totalAmount, totalOrders });
    });
    
})
},
  // -----banner section-----//

  addBanner: (banner) => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = await db.get().collection(collection.BANNER_COLLECTION).insertOne(banner);
        resolve(data.insertedId.toString());
      } catch (error) {
        reject(error);
      }
    });
  },

    getBanners: () => {
      return new Promise(async (resolve, reject) => {
        try {
          let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();
          
          resolve(banners);
          console.log(banners);
        } catch (error) {
          reject(error);
        }
      });
    },

    deleteBanner: (bannerId) => {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.BANNER_COLLECTION)
          .deleteOne({ _id: ObjectId(bannerId) })
          .then((response) => {
            resolve(response);
          });
      })
    },

    getAlluserorderPagination:(val)=>{
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

    getuserPagination:(val)=>{
      return new Promise(async(resolve,reject)=>{
        console.log(val)
        let productse = await db.get()
        .collection(collection.USER_COLLECTION)
        .find()
        .skip((val - 1)*9)
        .limit(9)
        .toArray()
        resolve(productse)
      })
    },

    searchUser:(search)=>{
      return new Promise(async (resolve,reject)=>{
        let products = await db.get().collection(collection.USER_COLLECTION)
        .find(   {$or: [
           { Name: { $regex: new RegExp('^' + search + '.*', 'i') } },
          { Email: { $regex: new RegExp('^' + search + '.*', 'i') } },
          
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


    //-------new sale report------//

    // for sales report //
  orderLastWeek: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(7, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

      try {
        const orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: "Delivered",
                date: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          ]).toArray();
          console.log(orderCount);
          console.log("qoooooo");
        resolve(orderCount);
      } catch (error) {
        reject(error);
      }
    });
  },
  orderLastMonth:() => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(30, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

      try {
        const orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
           
            {
              $match: {
                status: "Delivered",
                date: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          ]).toArray();
          console.log(orderCount);
          
        resolve(orderCount);
      } catch (error) {
        reject(error);
      }
    });
  },
  orderLastYear:() => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

      try {
        const orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
           
            {
              $match: {
                status: "Delivered",
                date: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          ]).toArray();
        resolve(orderCount);
      } catch (error) {
        reject(error);
      }
    });
  },

   // date filter
   orderInDate:(startDate,endDate) => {
    
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: "Delivered",
                date: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          ]).toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    })
  }
  



}
  
  
    
        
        
    