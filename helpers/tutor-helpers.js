var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
module.exports={
 addTutor:(tutorData)=>{
   return new Promise(async(resolve,reject)=>{
       tutorData.Password=await bcrypt.hash(tutorData.Password,10)
       db.get().collection(collection.TUTOR_COLLECTION).insertOne(tutorData).
       resolve(data.ops[0])
   })
 },doLogin:(tutorData)=>{
     return new Promise(async(resolve,reject)=>{
         let response={}
         let tutor=await db.get().collection(collection.TUTOR_COLLECTION)
         .findOne({Email:tutorData.Email})
         if(tutor){
             bcrypt.compare(tutorData.Password,tutor.Password).then((status)=>{
                 if(status){console.log('Login success');
                response.tutor=tutor
                response.status=true
                 resolve(response)}
                 else{console.log('Login failed incorrect password');
                 resolve({status:false})}
             })
         }else{console.log('Login failed incorrect email');
         resolve({status:false})}
     })
 }
}