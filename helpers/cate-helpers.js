const db=require('../config/connection')
const collection=require('../config/collections')
const objectId=require('mongodb').ObjectId

module.exports={
    

    addCategory:(category)=>{
        return new Promise(async (resolve,reject)=>{
            let catExist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({Category:category.Category})
         
            if(!catExist){

                let data = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category)
                console.log(data.Category)
                resolve(data);
                
            } else {
                let data = false
                resolve(data)
            }
        })
  
    },

    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
                resolve(category);
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // deleteCategory:(cateId)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(cateId)}).then((response)=>{
    //             console.log(response);
    //             resolve(response)
    //         })
    //     })
    // },
    getCategoryDetails:(cateId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(cateId)}).then((category)=>{
                resolve(category)
            })
        })
    },
    updateCategory:(cateId,cateDetails)=>{
        return new Promise(async(resolve,reject)=>{
      let catExist= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({Category:cateDetails.Category})
            if(!catExist){
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(cateId)},{
                $set:{
                    Category:cateDetails.Category,
                   photos:cateDetails.photos,   
                   
                }
            }).then((response)=>{
                resolve(response)
            })
        }else{
            let response=false;
            resolve(response)
        }
                
            
        })
    },

    HideCategory:(cateId)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(cateId)},{$set:{isHide:true}},(err,res)=>{
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
      unHideCategory:(cateId)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(cateId)},{$set:{isHide:false}},(err,res)=>{
            if(err){
              console.log("error :"+err)
              res.status(500).send("Error hide")
          }else{
              console.log('User Unhide')
              resolve("success")
          }
          })
        })
      }
}