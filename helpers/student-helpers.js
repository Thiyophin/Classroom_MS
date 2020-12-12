var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
var ObjectId = require('mongodb').ObjectID
var unirest = require('unirest');
import('dotenv')
module.exports = {
    addStudent: (student) => {
        //console.log(student);
        return new Promise(async (resolve, reject) => {
            student.Password = await bcrypt.hash(student.Password, 10)
            db.get().collection(collection.STUDENT_COLLECTION).insertOne(student).then((data) => {
                //console.log(data);
                resolve();
            })
        })
    },
    getAllStudents: () => {
        return new Promise(async (resolve, reject) => {
            let students = await db.get().collection(collection.STUDENT_COLLECTION).find()
                .toArray()
            resolve(students)
        })
    }, deleteStudent: (studentId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION).removeOne({ _id: ObjectId(studentId) })
                .then((response) => {
                    resolve(response)
                })
        })
    }, getStudentDetails: (studentId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION).findOne({ _id: ObjectId(studentId) })
                .then((student) => {
                    resolve(student)
                })
        })
    }, updateStudentDetails: (studentId, studentDetails) => {
        //console.log(tutorDetails);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENT_COLLECTION).
                updateOne({ _id: ObjectId(studentId) }, {
                    $set: {
                        Name: studentDetails.Name,
                        Gender: studentDetails.Gender,
                        RollNo: studentDetails.RollNo,
                        Mob: studentDetails.Mob,
                        Email: studentDetails.Email,
                        Address: studentDetails.Address

                    }
                }).then((response) => {
                    resolve()
                })
        })
    }, checkMobNum: (studentNum) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let student = await db.get().collection(collection.STUDENT_COLLECTION).findOne({ Mob: studentNum.Number })
            if (student) {
                var req = unirest('POST', 'https://d7networks.com/api/verifier/send')
                    .headers({
                        'Authorization': 'Token ' + process.env.TOKEN
                    })
                    .field('mobile', '91' + studentNum.Number)
                    .field('sender_id', 'SMSINFO')
                    .field('message', 'Your otp code for Classroom MS  is  {code}')
                    .field('expiry', '900')
                    .end(function (res) {
                        //console.log(res.raw_body);
                        response.otp_id = res.body.otp_id
                        response.student=res.body.student
                        response.status = true
                        resolve(response)
                    })

            }
            else {
                resolve({})
            }
        })
    }, verifyOtp: (otpDetails) => {
        return new Promise((resolve, reject) => {
            var req = unirest('POST', 'https://d7networks.com/api/verifier/verify')
                .headers({
                    'Authorization': 'Token ' + process.env.TOKEN
                })
                .field('otp_id', otpDetails.otp_id)
                .field('otp_code', otpDetails.OTP)
                .end(function (res) {
                    //console.log(res.body);
                    resolve(res.body)
                });
        })
    }, resentOtp: (otpId) => {
        return new Promise((resolve, reject) => {
            var unirest = require('unirest');
            var req = unirest('POST', 'https://d7networks.com/api/verifier/resend')
                .headers({
                    'Authorization': 'Token '+process.env.TOKEN
                })
                .field('otp_id', otpId)
                .end(function (res) {
                    resolve(res.raw_body)
                });

        })
    },changePassword:(newPass)=>{
        return new Promise(async(resolve,reject)=>{
            let student=await db.get().collection(collection.STUDENT_COLLECTION).findOne({Name:newPass.Name})
           if(student){
            newPass.Password = await bcrypt.hash(newPass.Password, 10)
               db.get().collection(collection.STUDENT_COLLECTION).updateOne({Name:newPass.Name},
                {
                    $set:{
                        Password:newPass.Password
                    }
                }).then((status)=>{
                    response.status=true
                    resolve(response)
                })
           }else{
               resolve({status:false})
           }
        })
    }
    ,doLogin:(studentData)=>{
        return new Promise(async(resolve,reject)=>{
           console.log(studentData);
            let response={}
            let student=await db.get().collection(collection.STUDENT_COLLECTION)
            .findOne({Name:studentData.Name})
            if (student){
                bcrypt.compare(studentData.Password,student.Password).then((status)=>{
                    if(status){
                        response.student=student
                        response.status=true
                        resolve(response)
                    }else{
                        resolve({status:false})
                    }   
                })  
            }else{
                resolve({status:false})
            }
        })
    }
}









