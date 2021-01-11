var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
var ObjectId = require("mongodb").ObjectID;
import("dotenv");
const Razorpay = require("razorpay");
const { resolve } = require("path");
var instance = new Razorpay({
  key_id: "rzp_test_negFMbiG8cSAhC",
  key_secret: "A3TBwltG5lVGqevsrLGlUrpA",
});
module.exports = {
  addStudent: (student) => {
    //console.log(student);
    return new Promise(async (resolve, reject) => {
      student.Password = await bcrypt.hash(student.Password, 10);
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .insertOne(student)
        .then((data) => {
          //console.log(data);
          resolve(data.ops[0]._id);
        });
    });
  },
  getAllStudents: () => {
    return new Promise(async (resolve, reject) => {
      let students = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .find()
        .toArray();
      resolve(students);
    });
  },
  deleteStudent: (studentId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .removeOne({ _id: ObjectId(studentId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getStudentDetails: (studentId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: ObjectId(studentId) })
        .then((student) => {
          resolve(student);
        });
    });
  },
  updateStudentDetails: (studentId, studentDetails) => {
    //console.log(tutorDetails);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.STUDENT_COLLECTION)
        .updateOne(
          { _id: ObjectId(studentId) },
          {
            $set: {
              Name: studentDetails.Name,
              Gender: studentDetails.Gender,
              RollNo: studentDetails.RollNo,
              Mob: studentDetails.Mob,
              Email: studentDetails.Email,
              Address: studentDetails.Address,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  checkMobNum: (studentNum) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let student = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ Mob: studentNum.Number });
      if (student) {
        var req = unirest("POST", "https://d7networks.com/api/verifier/send")
          .headers({
            Authorization: "Token " + process.env.TOKEN,
          })
          .field("mobile", "91" + studentNum.Number)
          .field("sender_id", "SMSINFO")
          .field("message", "Your otp code for Classroom MS  is  {code}")
          .field("expiry", "900")
          .end(function (res) {
            //console.log(res.raw_body);
            response.otp_id = res.body.otp_id;
            response.student = student;
            response.status = true;
            resolve(response);
          });
      } else {
        resolve({});
      }
    });
  },
  verifyOtp: (otpDetails) => {
    return new Promise((resolve, reject) => {
      var req = unirest("POST", "https://d7networks.com/api/verifier/verify")
        .headers({
          Authorization: "Token " + process.env.TOKEN,
        })
        .field("otp_id", otpDetails.otp_id)
        .field("otp_code", otpDetails.OTP)
        .end(function (res) {
          //console.log(res.body);
          resolve(res.body);
        });
    });
  },
  resentOtp: (otpId) => {
    return new Promise((resolve, reject) => {
      var unirest = require("unirest");
      var req = unirest("POST", "https://d7networks.com/api/verifier/resend")
        .headers({
          Authorization: "Token " + process.env.TOKEN,
        })
        .field("otp_id", otpId)
        .end(function (res) {
          resolve(res.raw_body);
        });
    });
  },
  changePassword: (Number, newPass) => {
    return new Promise(async (resolve, reject) => {
      console.log(Number);
      let student = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ Mob: Number });
      if (student) {
        newPass.Password = await bcrypt.hash(newPass.Password, 10);
        db.get()
          .collection(collection.STUDENT_COLLECTION)
          .updateOne(
            { Mob: Number },
            {
              $set: {
                Password: newPass.Password,
              },
            }
          )
          .then((status) => {
            response.status = true;
            resolve(response);
          });
      } else {
        resolve({ status: false });
      }
    });
  },
  doLogin: (studentData) => {
    return new Promise(async (resolve, reject) => {
      console.log(studentData);
      let response = {};
      let student = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ Name: studentData.Name });
      if (student) {
        bcrypt
          .compare(studentData.Password, student.Password)
          .then((status) => {
            if (status) {
              response.student = student;
              response.status = true;
              resolve(response);
            } else {
              resolve({ status: false });
            }
          });
      } else {
        resolve({ status: false });
      }
    });
  },
  getStudentProfileDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      let profile = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      resolve(profile);
    });
  },
  getAllAssignments: () => {
    return new Promise(async (resolve, reject) => {
      let assignments = await db
        .get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .find()
        .toArray();
      resolve(assignments);
    });
  },
  addStudentAssignment: (assignmentsID, studentId) => {
    return new Promise(async (resolve, reject) => {
      let studentAssignments = await db
        .get()
        .collection(collection.STUDENT_ASSIGNMENTS_COLLECTION)
        .findOne({ student: ObjectId(studentId) });
      if (studentAssignments) {
        db.get()
          .collection(collection.STUDENT_ASSIGNMENTS_COLLECTION)
          .updateOne(
            { student: ObjectId(studentId) },
            {
              $push: { assignments: ObjectId(assignmentsID) },
            }
          )
          .then((response) => {
            // console.log(response);
            resolve();
          });
      } else {
        let assignmentsObject = {
          student: ObjectId(studentId),
          assignments: [ObjectId(assignmentsID)],
        };
        db.get()
          .collection(collection.STUDENT_ASSIGNMENTS_COLLECTION)
          .insertOne(assignmentsObject)
          .then((response) => {
            // console.log(response);
            resolve();
          });
      }
    });
  },
  getAllNotes: () => {
    return new Promise(async (resolve, reject) => {
      let notes = await db
        .get()
        .collection(collection.NOTES_COLLECTION)
        .find()
        .toArray();
      resolve(notes.reverse());
    });
  },
  getLastAssignment: () => {
    return new Promise(async (resolve, reject) => {
      let assignment = await db
        .get()
        .collection(collection.ASSIGNMENT_COLLECTION)
        .find()
        .sort({ $natural: -1 })
        .limit(1)
        .toArray();
      // console.log(assignment);
      resolve(assignment);
    });
  },
  getLastNote: () => {
    return new Promise(async (resolve, reject) => {
      let note = await db
        .get()
        .collection(collection.NOTES_COLLECTION)
        .find()
        .sort({ $natural: -1 })
        .limit(1)
        .toArray();
      //console.log(note);
      resolve(note);
    });
  },
  registerAttendance: (date, studentId) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      const currentDate =
        new Date().getDate() +
        "/" +
        (new Date().getMonth() + 1) +
        "/" +
        new Date().getFullYear();
      console.log(currentDate + "created registerAttent Helpers");
      try {
        let presentDates = await db
          .get()
          .collection(collection.STUDENT_COLLECTION)
          .find(
            { _id: ObjectId(studentId) },
            { projection: { _id: 0, attendance: 1 } }
          )
          .toArray();
        // console.log(presentDates[0].attendance);
        if (currentDate === date) {
          if (presentDates[0].attendance.includes(currentDate)) {
            resolve();
            console.log("Already present today");
          } else {
            db.get()
              .collection(collection.STUDENT_COLLECTION)
              .updateOne(
                { _id: ObjectId(studentId) },
                {
                  $push: {
                    attendance: currentDate,
                  },
                }
              )
              .then(() => {
                console.log("Did not present today");
                resolve({ response: true });
              });
          }
        } else {
          resolve();
          console.log("absent");
        }
      } catch (err) {
        db.get()
          .collection(collection.STUDENT_COLLECTION)
          .updateOne(
            { _id: ObjectId(studentId) },
            {
              $push: {
                attendance: currentDate,
              },
            }
          )
          .then(() => {
            resolve({ response: true });
            console.log(response);
            console.log("Did not present till now");
          });
      }
    });
  },
  checkTodayStatus: (studentId) => {
    return new Promise(async (resolve, reject) => {
      //console.log("called");
      const currentDate =
        new Date().getDate() +
        "/" +
        (new Date().getMonth() + 1) +
        "/" +
        new Date().getFullYear();
      try {
        let presentDates = await db
          .get()
          .collection(collection.STUDENT_COLLECTION)
          .find(
            { _id: ObjectId(studentId) },
            { projection: { _id: 0, attendance: 1 } }
          )
          .toArray();
        if (presentDates[0].attendance.includes(currentDate)) {
          // console.log(presentDates[0].attendance);
          resolve({ response: true });
          //console.log("still no err found");
        } else {
          resolve();
        }
      } catch (err) {
        //console.log("err called");
        resolve();
      }
    });
  },
  getTotalDays: () => {
    return new Promise(async (resolve, reject) => {
      let days = await db
        .get()
        .collection(collection.NOTES_COLLECTION)
        .aggregate([{ $count: "dates" }])
        .toArray();
      resolve(days[0].dates);
    });
  },
  getPresentDays: (id) => {
    return new Promise(async (resolve, reject) => {
      var days = await db
        .get()
        .collection(collection.STUDENT_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(id) },
          },
          {
            $unwind: "$attendance",
          },
          {
            $count: "attendance",
          },
        ])
        .toArray();
      resolve(days[0].attendance);
    });
  },
  generateRazorpay: (eventId, amount) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: amount * 100, // amount in the smallest currency unit so *100
        currency: "INR",
        receipt: ""+eventId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log(order);
          resolve(order);
        }
      });
    });
  },
  verifyPayment: (details,studentId) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "A3TBwltG5lVGqevsrLGlUrpA");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        let paymentObj = {
          student: ObjectId(studentId),
          event: ObjectId(details["order[receipt]"]),
        };
        db.get().collection(collection.PAYMENT_COLLECTION).insertOne(paymentObj);
        resolve();
      } else {
        reject();
      }
    });
  },
  paymentDone: (eventId, studentId) => {
    return new Promise(async (resolve, reject) => {
      let paidevent = await db.get().collection(collection.EVENT_COLLECTION)
      .findOne({ _id: ObjectId(eventId), Type: "Paid" });
      if (paidevent) {
        if (
          await db.get().collection(collection.EVENT_COLLECTION)
            .findOne({ _id: ObjectId(eventId), student:ObjectId(studentId) })
        ) {
          console.log("already paid");
        } else {
          db.get().collection(collection.EVENT_COLLECTION).updateOne(
              { _id: ObjectId(eventId) },
              {
                $push: { student: ObjectId(studentId) },
              }
            ).then;
        }
      }
      resolve();
    });
  }, paypalPayment: (studId, eventId) => {
    return new Promise((resolve, reject) => {
      let paidObj = {
        student: ObjectId(studId),
        event: ObjectId(eventId),
      };
      db.get().collection(collection.PAYMENT_COLLECTION).insertOne(paidObj);
      resolve();
    });
  }
}
