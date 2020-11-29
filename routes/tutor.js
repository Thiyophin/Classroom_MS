var express = require('express');
var router = express.Router();
const tutorHelpers = require('../helpers/tutor-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/tutor_login',(req,res)=>{
  res.render('tutor/tutor_login')
})
router.get('/add_tutor',(req,res)=>{
  res.render('tutor/add_tutor')
})
router.post('/add_tutor',(req,res)=>{
  tutorHelpers.addTutor(req.body).then((response)=>{
    console.log(response);
  })
})
router.post('/tutor_login',(req,res)=>{
  tutorHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.render('tutor/tutor_home')
    }else{
      res.redirect('/tutor_login')
    }
  })
})

module.exports = router;
