var express = require('express');
var router = express.Router();
var studentHelpers = require('../helpers/student-helpers');
const { response } = require('express');

/* GET student listing. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/student_sentotp',(req,res)=>{
  res.render('student/student_sentotp')
})

router.post('/student_sentotp',(req,res)=>{
 studentHelpers.checkMobNum(req.body).then((response)=>{
   //console.log(response);
   if(response.status){
      res.json(response)
   }else{
   res.json({status:false})
   }
 })
})

router.get('/student_verifyOtp/:otpId',(req,res)=>{
  let otpId=req.params.otpId
  res.render('student/student_verifyOtp',{otpId})
})
router.post('/student_verifyOtp',(req,res)=>{
  studentHelpers.verifyOtp(req.body).then((response)=>{
    console.log(response);
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
  res.render('student/student_login')
})

module.exports = router;
