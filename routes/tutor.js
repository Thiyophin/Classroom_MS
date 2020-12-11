var express = require('express');
var router = express.Router();
var tutorHelpers = require('../helpers/tutor-helpers')
var studentHelpers = require('../helpers/student-helpers');
const { response } = require('express');

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
      req.check('Password','Invalid Username or Password').isLength({min:50})
      var errors=req.validationErrors();
      req.session.errors=errors
      res.redirect('/tutor_login')
    }
  })}
})
router.get('/logout',(req,res)=>{
  req.session.tutor=null
  req.session.loggedTutorIn=false
  res.redirect('/')
})
router.get('/tutor_profile',verifyLogin,(req,res)=>{
  tutorHelpers.getProfileDetails().then((profile)=>{
//console.log(profile);
res.render('tutor/tutor_profile',{tutor:true,profile})
  })
})
router.get('/tutor_editprofile/:id',verifyLogin,async(req,res)=>{
  let profile=await tutorHelpers.getTutorDetails(req.params.id)
  //console.log(profile);
 res.render('tutor/tutor_editprofile',{tutor:true,profile})
})
router.post('/tutor_editprofile',(req,res)=>{
  // console.log(req.body);
tutorHelpers.updateProfile(req.body).then(()=>{
  res.redirect('/tutor_profile')
  let id=req.body.id
  if(req.files.Image){
    let image=req.files.Image
    image.mv('./public/tutor-images/'+id+'.jpg')
  }
})
})
router.get('/tutor_students',verifyLogin,(req,res)=>{
  studentHelpers.getAllStudents().then((students)=>{
    //console.log(students);
    res.render('tutor/tutor_students',{tutor:true,students})
  })
})

router.get('/tutor_addstudent',verifyLogin,(req,res)=>{
  res.render('tutor/tutor_addstudent',{tutor:true})
})
router.post('/tutor_addstudent',(req,res)=>{
 studentHelpers.addStudent(req.body).then(()=>{
   res.redirect('/tutor_students')
 })
})

router.get('/delete_student/:id',verifyLogin,(req,res)=>{
  let studentId=req.params.id
 // console.log(studentId);
studentHelpers.deleteStudent(studentId).then((response)=>{
  res.redirect('/tutor_students')
})
})

router.get('/tutor_editstudent/:id',verifyLogin,async(req,res)=>{
  let student=await studentHelpers.getStudentDetails(req.params.id)
  //console.log(student);
res.render('tutor/tutor_editstudent',{tutor:true,student})
})
router.post('/tutor_editstudent/:id',(req,res)=>{
  studentHelpers.updateStudentDetails(req.params.id,req.body).then(()=>{
    res.redirect('/tutor_students')
  })
})

router.get('/tutor_assignments',verifyLogin,async(req,res)=>{
  let assignments=await tutorHelpers.getAllAssignments()
  res.render('tutor/tutor_assignments',{tutor:true,assignments})
})

router.post('/tutor_assignments',(req,res)=>{
  tutorHelpers.addAssignment(req.body).then((id)=>{
    let assignment=req.files.Assignment
    console.log(id);
    assignment.mv('./public/assignments/'+id+'.pdf')
res.redirect('/tutor_assignments')
  })
})

router.get('/delete_assignment/:id',verifyLogin,(req,res)=>{
  let assignmentId=req.params.id
  console.log(assignmentId);
tutorHelpers.deleteAssignment(assignmentId).then((response)=>{
  res.redirect('/tutor_assignments')
})
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
