var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers');
const { response } = require('express');
const { default: swal } = require('sweetalert');
const { HTTPVersionNotSupported } = require('http-errors');
var path = require('path');
const { log } = require('console');

const  verifyStudentIn= (req, res, next) => {
  if (req.session.loggedStudentIn) { next() }
  else { res.redirect('/student/student_login') }
}
/* GET student listing. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/student_loginUseOtp',(req,res)=>{
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    res.render('student/student_loginUseOtp')
  }
})

router.post('/student_loginUseOtp',(req,res)=>{
  studentHelpers.checkMobNum(req.body).then((response)=>{
    if(response.status){
      req.session.student=response.student
       res.json(response)
    }else{
    res.json({status:false})
    }
  })
 })

 router.get('/student_verifyOtpLogin/:otpId',(req,res)=>{
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    let otpId=req.params.otpId
    res.render('student/student_verifyOtpLogin',{otpId})
  }
})

router.post('/student_verifyOtpLogin',(req,res)=>{
  studentHelpers.verifyOtp(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      req.session.loggedStudentIn=true
      res.json(response)
    }else{
      res.json({})
    }
  })
})

router.get('/student_resentOtpLogin/:otpId',(req,res)=>{
  let otpId=req.params.otpId
  studentHelpers.resentOtp(otpId).then((response)=>{
    res.redirect('/student/student_verifyOtpLogin/'+otpId)
  })
})

router.get('/student_sentotp',(req,res)=>{
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    res.render('student/student_sentotp')
  }
})

router.post('/student_sentotp',(req,res)=>{
 studentHelpers.checkMobNum(req.body).then((response)=>{
   if(response.status){
    req.session.Number=response.student.Mob
   // console.log(req.session.Number);
      res.json(response)
   }else{
   res.json({status:false})
   }
 })
})

router.get('/student_verifyOtp/:otpId',(req,res)=>{
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    let otpId=req.params.otpId
    res.render('student/student_verifyOtp',{otpId})
  }
})
router.post('/student_verifyOtp',(req,res)=>{
    studentHelpers.verifyOtp(req.body).then((response)=>{
      //console.log(response);
      if(response.status){
        res.json(response)
      }else{
        res.json({})
      }
    })
})

router.get('/student_resentOtp/:otpId',(req,res)=>{
    let otpId=req.params.otpId
    studentHelpers.resentOtp(otpId).then((response)=>{
      res.redirect('/student/student_verifyOtp/'+otpId)
    })
})

router.get('/student_login',(req,res)=>{
  //console.log(req.session.Number);
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    res.render('student/student_login',{error:req.session.loginErr}) 
    req.session.loginErr=null
  } 
})

router.post('/student_login',(req,res)=>{
    studentHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.student=response.student
        req.session.loggedStudentIn=true
        req.session.Number=null
        res.redirect('/student/student_home')
      }else{
        req.session.loginErr="Invalid username or password"
        res.redirect('/student/student_login')
      }
    })
})

router.get('/student_changepassword',(req,res)=>{
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    res.render('student/student_changepassword',{error:req.session.loginErr})
    req.session.loginErr=null
  }
})

router.post('/student_changepassword',(req,res)=>{
  //console.log(req.body);
 req.check('newPass','Passwords do not match').isLength({min:8}).equals(req.body.Password)
 var error=req.validationErrors()
 if(error){
req.session.loginErr=error
//console.log(req.session.Number);
res.redirect('/student/student_changepassword')
 }else{
   studentHelpers.changePassword(req.session.Number,req.body).then((response)=>{
      res.redirect('/student/student_login')
   })
 }
})
router.get('/student_profile', verifyStudentIn, (req, res) => {
  id=req.session.student._id
  studentHelpers.getStudentProfileDetails(id).then((profile) => {
    res.render('student/student_profile', { student: true, profile })
    console.log(profile);
  })
})

router.get('/student_assignment',verifyStudentIn,(req,res)=>{
  studentHelpers.getAllAssignments().then((assignments)=>{
    console.log(assignments);
    res.render('student/student_assignment',{student:true,studentId:req.session.student._id,assignments,pdfError:req.session.pdfError})
    req.session.pdfError=null
  })
})

router.post('/student_submitAssignment/:assignmentsId',verifyStudentIn,(req,res)=>{
  if (req.files) {
    let studentId=req.session.student._id
    let assignmentsId=req.params.assignmentsId
    let assignment = req.files.Assignment
    let assignmentList = ['.pdf', 'DOC', 'DOCX', 'TXT'];
    let extName = path.extname(assignment.name)
    if (assignmentList.includes(extName)){
      studentHelpers.addStudentAssignment(assignmentsId,studentId).then(() => {
        assignment.mv('./public/studentAssignments/'+assignmentsId+'.'+studentId+'.pdf')
        res.redirect('/student/student_assignment')
   })}else{
     req.session.pdfError="Document file cannot be recongnized"
    res.redirect('/student/student_assignment')
   }
  }else{
    req.session.pdfError="Document field is empty"
   res.redirect('/student/student_assignment')
  }
})

router.get('/student_notes',verifyStudentIn,(req,res)=>{
  studentHelpers.getAllNotes().then((notes)=>{
  res.render('student/student_notes',{student:true,notes,student:req.session.student})
})
})

router.get('/student_registerAttendance/:dd/:mm/:yyyy',verifyStudentIn,(req,res)=>{
 let date = +req.params.dd+'/'+req.params.mm+'/'+req.params.yyyy
 //console.log(date+"date after video end")
 studentHelpers.registerAttendance(date,req.session.student._id).then((response)=>{
  if(response){
    res.json({status:true})
    console.log("Present marked")
  }else{
    res.json({})
    console.log("absent marked")
  }
 })
})

router.get('/student_task',verifyStudentIn,async(req,res)=>{
  let assignment = await studentHelpers.getLastAssignment()
  let note = await studentHelpers.getLastNote()
  res.render('student/student_task',{student:true,studentId:req.session.student._id,assignment,note})
})

router.get('/student_attendance',verifyStudentIn,async(req,res)=>{
  let totalDays=await studentHelpers.getTotalDays()
   let presentDays=await studentHelpers.getPresentDays(req.session.student._id)
   let absentDays=totalDays-presentDays
   let percentage=(presentDays/totalDays)*100
  res.render('student/student_attendance',{student:true,totalDays,presentDays,absentDays,percentage})
})

router.get('/student_home',verifyStudentIn,async(req,res)=>{
  let studentStatus= await  studentHelpers.checkTodayStatus(req.session.student._id)
  //console.log(studentStatus);
  res.render('student/student_home',{student:true,status:studentStatus})
})

router.get('/student_logout',(req,res)=>{
  req.session.student=null
  req.session.loggedStudentIn=false
  res.redirect('/')
})

module.exports = router;
