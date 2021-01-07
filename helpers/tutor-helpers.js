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
                 MobileNo:tutorDetails.MobileNo,
                 Email:tutorDetails.Email
             }
         }).then((response)=>{
             resolve()
         })
     })
 },addAssignment:(assignment)=>{
     return new Promise((resolve,reject)=>{
        db.get().collection(collection.ASSIGNMENT_COLLECTION).insertOne(assignment).then((response)=>{
           // console.log(response); 
            resolve(response.ops[0]._id)
         })
     })
 },getAllAssignments:()=>{
     return new Promise((resolve,reject)=>{
         db.get().collection(collection.ASSIGNMENT_COLLECTION).find().toArray().then((response)=>{
              //console.log(response);
             resolve(response)
         })
         
     })
 }, deleteAssignment: (assignmentId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ASSIGNMENT_COLLECTION).removeOne({ _id: ObjectId(assignmentId) })
            .then((response) => {
                resolve(response)
            })
    })
},assignmentsSubmitted:(studentId)=>{
    return new Promise(async(resolve,reject)=>{
       try{ let assignmentsSubmitted = await db.get().collection(collection.STUDENT_ASSIGNMENTS_COLLECTION)
        .aggregate([
            {
                $match:{student:ObjectId(studentId)}
            },{
                $lookup:{
                    from:collection.ASSIGNMENT_COLLECTION,
                    let :{assignmentList:'$assignments'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $in:['$_id',"$$assignmentList"]
                                }
                            }
                        }
                    ],as:'assignmentsSubmitted'
                }
            }
        ]).toArray()
        resolve(assignmentsSubmitted[0].assignmentsSubmitted)}
        catch(err){
            resolve()
        }
    })
},addNotes:(notes)=>{
    return new Promise((resolve,reject)=>{
        const date =   (new Date().getDate())+"/"+(new Date().getMonth() + 1)+ "/" + new Date().getFullYear()
       db.get().collection(collection.NOTES_COLLECTION).insertOne({notes,date}).then((response)=>{
          // console.log(response); 
           resolve(response.ops[0]._id)
        })
    })
},getAllNotes:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.NOTES_COLLECTION).find().toArray().then((response)=>{
             //console.log(response);
            resolve(response.reverse())
        })
        
    })
},deleteNotes: (notesId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.NOTES_COLLECTION).removeOne({ _id: ObjectId(notesId) })
            .then((response) => {
                resolve(response)
            })
    })
},getTodayAttendance:()=>{
    return new Promise(async(resolve,reject)=>{
    let todayDate=(new Date().getDate())+"/"+(new Date().getMonth() + 1)+ "/" + new Date().getFullYear()
    let todayAttendance= await db.get().collection(collection.STUDENT_COLLECTION)
    .aggregate([
        { $addFields: { lastPresent: { $last: "$attendance" } } },
        {$project:{_id:0,Name:1,RollNo:1,lastPresent:1
            ,status:{$eq:["$lastPresent",todayDate]}}}
        ]).toArray()
    resolve(todayAttendance)
})
},getThisAttendance:(date)=>{
return new Promise(async(resolve,reject)=>{
    let todayAttendance= await db.get().collection(collection.STUDENT_COLLECTION)
    .aggregate([
        {$addFields:{status:{
            $cond:[{$in: [ date, "$attendance" ] }, true, false ]
            }}},
        {$project:{_id:0,Name:1,RollNo:1,status:1}}
        ]).toArray()
        //console.log(todayAttendance);
        resolve(todayAttendance)
})
},addAnnouncement:(announcement)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION).insertOne(announcement).then((response)=>{
            resolve(response.ops[0]._id)   
        })
    })
},getAllAnnouncements:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION).find().toArray().then((response)=>{
            resolve(response.reverse())
        })
    })
},getThisAnnounce:(id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION).findOne({_id:ObjectId(id)})
        .then((response)=>{
            resolve(response)
        })
    })
},deleteAnnouncement:(id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION).removeOne({_id:ObjectId(id)})
        .then((response)=>{
            resolve()
        })
    })
},addPhotos:(photo)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PHOTO_COLLECTION).insertOne(photo).then((response)=>{
         resolve(response.ops[0]._id)    
        })
    })
},getPhotos:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PHOTO_COLLECTION).find().toArray().then((response)=>{
            resolve(response.reverse())
        })
    })
},deletePhoto:(id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PHOTO_COLLECTION).removeOne({_id:ObjectId(id)}).then((response)=>{
       resolve()
        })
    })
}
}