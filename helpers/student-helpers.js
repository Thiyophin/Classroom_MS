var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var ObjectId=require('mongodb').ObjectID

module.exports={
    addStudent:(student)=>{
   //console.log(student);
   return new Promise ((resolve,reject)=>{
    db.get().collection(collection.STUDENT_COLLECTION).insertOne(student).then((data)=>{
        //console.log(data);
        resolve();
    })
   })
    },
    getAllStudents:()=>{
        return new Promise(async(resolve,reject)=>{
            let students=await db.get().collection(collection.STUDENT_COLLECTION).find()
            .toArray()
            resolve(students)
        })
    },deleteStudent:(studentId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.STUDENT_COLLECTION).removeOne({_id:ObjectId(studentId)})
            .then((response)=>{
                resolve(response)
            })
        })
    },getStudentDetails:(studentId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.STUDENT_COLLECTION).findOne({_id:ObjectId(studentId)})
            .then((student)=>{
                resolve(student)
            })
        })
    },updateStudentDetails:(studentId,studentDetails)=>{
        //console.log(tutorDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.STUDENT_COLLECTION).
            updateOne({_id:ObjectId(studentId)},{
                $set:{
                    Name:studentDetails.Name,
                    Gender:studentDetails.Gender,
                    RollNo:studentDetails.RollNo,
                    Mob:studentDetails.Mob,
                    Email:studentDetails.Email,
                    Address:studentDetails.Address
                    
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}