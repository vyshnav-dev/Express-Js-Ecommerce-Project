const db=require('../config/connection')
const collection=require('../config/collections')
const objectId=require('mongodb').ObjectId

module.exports={
    

    // ----new addproduct---//
    addProduct: (product, callback) => {
      console.log(product)
    
      db.get()
        .collection("product")
        .insertOne(product)
        .then((data) => {
          console.log("this is the id :" + data.insertedId);
          callback(data.insertedId);
      });
    },

    getAllProducts: () => {
      return new Promise(async (resolve, reject) => {
          try {
              let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
              resolve(products);
          } catch (error) {
              reject(error);
          }
      });
  },
  
    // deleteProduct:(prodId)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
    //             console.log(response);
    //             resolve(response)
    //         })
    //     })
    // },
    getProductDetails: (prodId) => {
      return new Promise((resolve, reject) => {
          try {
              db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(prodId)}).then((product) => {
                  resolve(product);

              });
          } catch (error) {
              reject(error);
          }
      });
  },
  
    updateProduct:(prodId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Stock:proDetails.Stock,
                    Category:proDetails.Category,
                    photos:proDetails.photos
                }
            }).then((response)=>{
                resolve()
            })
                
            
        })
    },

    HideProduct:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{$set:{isHide:true}},(err,res)=>{
            if(err){
              console.log("error :"+err)
              res.status(500).send("Error hiding")
          }else{
              console.log('User Hide')
              resolve("success")
          }
          })
        })
      },
      unHideProduct:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodId)},{$set:{isHide:false}},(err,res)=>{
            if(err){
              console.log("error :"+err)
              res.status(500).send("Error hide")
          }else{
              console.log('User Unhide')
              resolve("success")
          }
          })
        })
      },
      getLatestProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let ltstProducts = await db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .find()
            .sort({_id: -1})  //Sort by _id field in descending order
            .limit(6)   // Limit the result to 8 documents
            .toArray();
            resolve(ltstProducts) 
        })
    },
    getAllProductsPagination:(val)=>{
        return new Promise(async(resolve,reject)=>{
          console.log(val)
          let productse = await db.get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .skip((val - 1)*9)
          .limit(9)
          .toArray()
          resolve(productse)
        })
      },

      searchProducts:(search)=>{
        return new Promise(async (resolve,reject)=>{
          let products = await db.get().collection(collection.PRODUCT_COLLECTION)
          .find(   {$or: [
             { Category: { $regex: new RegExp('^' + search + '.*', 'i') } },
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

      changeQuantity: (products) => {
        return new Promise((resolve) => {
          var bulkOperations = products.map((product) => ({
            updateOne: {
              filter: { _id: product.item, Stock: { $gt: 0 } },
              update: { $inc: { Stock: -product.quantity } },
            },
          }));
    
          db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .bulkWrite(bulkOperations);
    
          resolve();
        });
      },

      getStock: (data) => {
        return new Promise(async (resolve,reject) => {
          try {
            let stock = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .findOne({ _id: objectId(data.product) });
              resolve(stock)
          } catch (error) {
            reject(error)
          }
        });
      }
}