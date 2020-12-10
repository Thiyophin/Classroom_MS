var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers');
const { response } = require('express');
const { default: swal } = require('sweetalert');
const { HTTPVersionNotSupported } = require('http-errors');

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
  if(req.session.loggedStudentIn){
    res.redirect('/student/student_home')
  }else{
    studentHelpers.verifyOtp(req.body).then((response)=>{
      //console.log(response);
      if(response.status){
        res.json(response)
      }else{
        res.json({})
      }
    })
  }
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
    req.session.loginErr=false
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

router.get('/student_home',(req,res)=>{
  res.render('student/student_home',{student:true})
})

router.get('/student_logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
