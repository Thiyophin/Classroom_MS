var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers');
const { response } = require('express');
const { default: swal } = require('sweetalert');
const { HTTPVersionNotSupported } = require('http-errors');

const  verifyStudentIn= (req, res, next) => {
  if (req.session.loggedStudentIn) { next() }
  else { res.redirect('/student/student_login') }
}
/* GET student listing. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/student_sentotp',(req,res)=>{
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    res.render('student/student_sentotp')
  }
})

router.post('/student_sentotp',(req,res)=>{
 studentHelpers.checkMobNum(req.body).then((response)=>{
  // console.log(req.body.Number);
   if(response.status){
     req.session.student=response.student
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
        req.session.loggedStudentIn=true
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
    res.render('student/student_changepassword',{error:req.session.loginErr,errors:req.session.loginErrs})
    req.session.loginErr=null
    req.session.loginErrs=null
  }
})

router.post('/student_changepassword',(req,res)=>{
 req.check('newPass','Passwords do not match').isLength({min:8}).equals(req.body.Password)
 var error=req.validationErrors()
 if(error){
req.session.loginErr=error
res.redirect('/student/student_changepassword')
 }else{
   studentHelpers.changePassword(req.body).then((response)=>{
     if(response.status){
      res.redirect('/student/student_login')
     }
   else{
     req.session.loginErrs='Invalid Username'
     res.redirect('/student/student_changepassword')
   }
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
    res.render('student/student_assignment',{student:true,assignments})
  })
})

router.get('/student_home',verifyStudentIn,(req,res)=>{
  res.render('student/student_home',{student:true})
})

router.get('/student_logout',(req,res)=>{
  req.session.student=null
  req.session.loggedStudentIn=false
  res.redirect('/')
})

module.exports = router;
