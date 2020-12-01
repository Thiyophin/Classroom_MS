var express = require('express');
var router = express.Router();
const tutorHelpers = require('../helpers/tutor-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/tutor_login',(req,res)=>{
  let response=req.session
  if(req.session.loggedTutorIn){
    res.render('tutor/tutor_home',{response,tutor:true})
  }else{
    res.render('tutor/tutor_login',{errors:req.session.errors})
    req.session.errors=null}
})

router.post('/tutor_login',(req,res)=>{
  req.check('Email','Invalid Username ').isEmail()
  req.check('Password','Invalid Password').isLength({min:7})
  var errors=req.validationErrors();
  if(errors){
    req.session.errors=errors
    res.redirect('/tutor_login')
  }else{
  tutorHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
     req.session.loggedTutorIn=true
     req.session.tutor=response.tutor
     //console.log(req.session);
      res.render('tutor/tutor_home',{response,tutor:true})
    }else{
      res.redirect('/tutor_login')
    }
  })}
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
//Add tutor to database
// router.get('/add_tutor',(req,res)=>{
//   res.render('tutor/add_tutor')  
// })
// router.post('/add_tutor',(req,res)=>{
//   tutorHelpers.addTutor(req.body).then((response)=>{
//     console.log(response);
//     res.redirect('/add_tutor')
//   })
// })

module.exports = router;
