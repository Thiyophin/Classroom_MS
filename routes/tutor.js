var express = require('express');
var router = express.Router();
const tutorHelpers = require('../helpers/tutor-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedTutorIn){next()}
  else{res.redirect('/tutor_login')}
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/tutor_login',(req,res)=>{
  if(req.session.loggedTutorIn){
    res.render('tutor/tutor_home',{tutor:true})
  }else{
    res.render('tutor/tutor_login',{errors:req.session.errors})
    req.session.errors=null
   }
})

router.post('/tutor_login',(req,res)=>{
  req.check('Email','Invalid Username ').isEmail()
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
      req.check('Password','Invalid Username or Password').isLength({min:25})
      var errors=req.validationErrors();
      req.session.errors=errors
      res.redirect('/tutor_login')
    }
  })}
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/tutor_profile',verifyLogin,(req,res)=>{
  let user=req.session.tutor
  //console.log(user.Name);
  res.render('tutor/tutor_profile',{tutor:true,user})
})
router.get('/tutor_home',verifyLogin,(req,res)=>{
  res.render('tutor/tutor_home',{tutor:true})
})

 
//   router.get('/add_tutor',(req,res)=>{
//     res.render('tutor/add_tutor')  
//   })
//   router.post('/add_tutor',(req,res)=>{
//    tutorHelpers.addTutor(req.body).then((id)=>{
//     /* when resolve(data.ops[0]) this console
//      console.log(response); */
//      console.log(req.files.Image);
//      console.log(req.body);
//      let image=req.files.Image
//      image.mv('./public/tutor-images/'+id+'.jpg'),(err,done)=>{
//      if(!err){res.render('tutor/add_tutor')}
//      else{console.log(err);}
//      } 
//    })
//  })

module.exports = router;
