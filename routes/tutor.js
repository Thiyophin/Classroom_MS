var express = require('express');
var router = express.Router();
var tutorHelpers = require('../helpers/tutor-helpers')
var studentHelpers = require('../helpers/student-helpers');
const { response } = require('express');
var path = require('path');
var fs = require('fs');

const verifyLogin = (req, res, next) => {
  if (req.session.loggedTutorIn) { next() }
  else { res.redirect('/tutor_login') }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/tutor_login', (req, res) => {
  if (req.session.loggedTutorIn) {
    res.render('tutor/tutor_home', { tutor: true })
  } else {
    res.render('tutor/tutor_login', { errors: req.session.errors })
    req.session.errors = null
  }
})

router.post('/tutor_login', (req, res) => {
  req.check('Email', 'Invalid Username ').isEmail()
  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors
    res.redirect('/tutor_login')
  } else {
    tutorHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedTutorIn = true
        req.session.tutor = response.tutor
        //console.log(req.session);
        res.render('tutor/tutor_home', { response, tutor: true })
      } else {
        req.check('Password', 'Invalid Username or Password').isLength({ min: 50 })
        var errors = req.validationErrors();
        req.session.errors = errors
        res.redirect('/tutor_login')
      }
    })
  }
})
router.get('/logout', (req, res) => {
  req.session.tutor = null
  req.session.loggedTutorIn = false
  res.redirect('/')
})
router.get('/tutor_profile', verifyLogin, (req, res) => {
  tutorHelpers.getProfileDetails().then((profile) => {
    //console.log(profile);
    res.render('tutor/tutor_profile', { tutor: true, profile })
  })
})
router.get('/tutor_editprofile', verifyLogin, async (req, res) => {
  let profile = await tutorHelpers.getTutorDetails(req.query.id)
  //console.log(profile);
  res.render('tutor/tutor_editprofile', { tutor: true, profile,photoError:req.session.photoError})
req.session.photoError=null
})
router.post('/tutor_editprofile', (req, res) => {
  // console.log(req.body);
  tutorHelpers.updateProfile(req.body).then(() => {
    let id = req.body.id
    if (req.files) {
      let image = req.files.Image
      let extName = path.extname(image.name)
      let imgList = ['.png', '.jpg', '.jpeg', '.gif'];
         if (imgList.includes(extName)) {
           image.mv('./public/tutor-images/' + id + '.jpg')
           res.redirect('/tutor_profile')
          }else{
        req.session.photoError="FAILED!!! Image format not recongnized"
        res.redirect('/tutor_editprofile')
      }
    }else{ res.redirect('/tutor_profile')}
  })
})
router.get('/tutor_students', verifyLogin, (req, res) => {
  studentHelpers.getAllStudents().then((students) => {
    //console.log(students);
    res.render('tutor/tutor_students', { tutor: true, students })
  })
})

router.get('/tutor_addstudent', verifyLogin, (req, res) => {
  res.render('tutor/tutor_addstudent', { tutor: true ,photoError:req.session.photoError})
  req.session.photoError=null
})
router.post('/tutor_addstudent', (req, res) => {
  if (req.files.Image) {
    let image = req.files.Image
    let extName = path.extname(image.name)
    let imgList = ['.png', '.jpg', '.jpeg'];
    if (imgList.includes(extName)){
  studentHelpers.addStudent(req.body).then((id) => {
    res.redirect('/tutor_students')
    let image=req.files.Image
    image.mv('./public/students-images/'+id+'.jpg')
  })}else{
    req.session.photoError="FAILED!!! Image format not recongnized"
    res.redirect('/tutor_addstudent')
  }
  }
})

router.get('/delete_student/:id', verifyLogin, (req, res) => {
  let studentId = req.params.id
  // console.log(studentId);
  studentHelpers.deleteStudent(studentId).then((response) => {
    fs.unlink('./public/students-images/'+studentId+'.jpg', function (err) {
      if (err) throw err;
      console.log('File deleted!');
    });
    res.redirect('/tutor_students')
  })
})

router.get('/tutor_editstudent', verifyLogin, async (req, res) => {
  let student = await studentHelpers.getStudentDetails(req.query.id)
  //console.log(student);
  res.render('tutor/tutor_editstudent', { tutor: true, student ,photoError:req.session.photoError})
req.session.photoError=null
})
router.post('/tutor_editstudent/:id', (req, res) => {
  studentHelpers.updateStudentDetails(req.params.id, req.body).then(() => {
    if (req.files) {
    let image = req.files.Image
    let extName = path.extname(image.name)
    let imgList = ['.png', '.jpg', '.jpeg'];
        if (imgList.includes(extName)) {
         let id = req.body.id
           image.mv('./public/students-images/' + id + '.jpg')
           res.redirect('/tutor_students')}
        else{
          req.session.photoError="FAILED!!! Image format not recongnized"
          res.redirect('/tutor_editstudent')
    }}else{
    res.redirect('/tutor_students')
     }
  })
})

router.get('/tutor_assignments', verifyLogin, async (req, res) => {
  let assignments = await tutorHelpers.getAllAssignments()
  res.render('tutor/tutor_assignments', { tutor: true, assignments ,pdfError:req.session.pdfError})
  req.session.pdfError=null
})

router.post('/tutor_assignments', (req, res) => {
  if (req.files.Assignment) {
    let assignment = req.files.Assignment
    let assignmentList = ['.pdf', 'DOC', 'DOCX', 'TXT'];
    let extName = path.extname(assignment.name)
    if (assignmentList.includes(extName)){
      tutorHelpers.addAssignment(req.body).then((id) => {
        assignment.mv('./public/assignments/' + id + '.pdf')
        res.redirect('/tutor_assignments')
   })}else{
     req.session.pdfError="Document file cannot be recongnized"
    res.redirect('/tutor_assignments')
   }
  }
})

router.get('/delete_assignment/:id', verifyLogin, (req, res) => {
  let assignmentId = req.params.id
  console.log(assignmentId);
  tutorHelpers.deleteAssignment(assignmentId).then((response) => {
    fs.unlink('./public/assignments/'+assignmentId+'.pdf', function (err) {
      if (err) throw err;
      console.log('File deleted!');
    });
    res.redirect('/tutor_assignments')
  })
})

router.get('/tutor_validateStudAssignments',verifyLogin,async(req,res)=>{
  let assignments = await tutorHelpers.assignmentsSubmitted(req.query.id)
 console.log(assignments);
 let profile = req.query
 //console.log(profile);
  res.render('tutor/tutor_validateStudAssignments',{tutor:true,assignments,profile})
})

router.get('/tutor_notes',verifyLogin,async(req,res)=>{
  let notes = await tutorHelpers.getAllNotes()
  console.log(notes);
  res.render('tutor/tutor_notes',{tutor:true,notes})
})

router.post('/tutor_notes',(req,res)=>{
  tutorHelpers.addNotes(req.body).then((id)=>{
  let Document = req.files.Document
  let Video = req.files.Video
  Document.mv('./public/documents/' + id + '.pdf')
  Video.mv('./public/videos/' + id + '.mp4')
  res.redirect('/tutor_notes')
  })
})

router.get('/tutor_deleteNotes/:id', verifyLogin, (req, res) => {
  let notesId = req.params.id
  console.log(notesId);
  tutorHelpers.deleteNotes(notesId).then((response) => {
    fs.unlink('./public/documents/'+notesId+'.pdf', function (err) {
      if (err) throw err;
     // console.log('document deleted!');
    });
    fs.unlink('./public/videos/'+notesId+'.mp4',function (err) {
      if (err) throw err;
     // console.log('videos deleted!');
    });
    res.redirect('/tutor_notes')
  })
})

router.get('/tutor_home', verifyLogin, (req, res) => {
  res.render('tutor/tutor_home', { tutor: true })
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
