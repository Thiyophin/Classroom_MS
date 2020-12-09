var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var ObjectId=require('mongodb').ObjectID
module.exports={
 addTutor:(tutorData)=>{
   return new Promise(async(resolve,reject)=>{
       tutorData.Password=await bcrypt.hash(tutorData.Password,10)
       db.get().collection(collection.TUTOR_COLLECTION).insertOne(tutorData).
       then((data)=>{
       resolve(data.ops[0]._id)
    })
   })
 },doLogin:(tutorData)=>{
     return new Promise(async(resolve,reject)=>{
         let response={}
         let tutor=await db.get().collection(collection.TUTOR_COLLECTION)
         .findOne({Email:tutorData.Email})
         if(tutor){
             bcrypt.compare(tutorData.Password,tutor.Password).then((status)=>{
                 if(status){//console.log('Login success');
                response.tutor=tutor
                response.status=true
                 resolve(response)}
                 else{//console.log('Login failed incorrect password');
                 resolve({status:false})}
             })
         }else{//console.log('Login failed incorrect email');
         resolve({status:false})}
     })
 },getProfileDetails:()=>{
  return new Promise(async(resolve,reject)=>{
      let profile=await db.get().collection(collection.TUTOR_COLLECTION).find().toArray()
      resolve(profile)
  })
 },getTutorDetails:(tutorId)=>{
   return new Promise((resolve,reject)=>{
       db.get().collection(collection.TUTOR_COLLECTION).findOne({_id:ObjectId(tutorId)}).then((profile)=>{
           resolve(profile)
       })
   })
 },updateProfile:(tutorDetails)=>{
     //console.log(tutorDetails);
     return new Promise((resolve,reject)=>{
         db.get().collection(collection.TUTOR_COLLECTION).
         updateOne({_id:ObjectId(tutorDetails.id)},{
             $set:{
                 Name:tutorDetails.Name,
                 Class:tutorDetails.Class,
                 Subject:tutorDetails.Subject,
                 Address:tutorDetails.Address,
                 Pincode:tutorDetails.Pincode,
                 MobileNo:tutorDetails.MobileNo,
                 Email:tutorDetails.Email
             }
         }).then((response)=>{
             resolve()
         })
     })
 }
}