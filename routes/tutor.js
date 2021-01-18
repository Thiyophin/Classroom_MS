var express = require("express");
var router = express.Router();
var tutorHelpers = require("../helpers/tutor-helpers");
var studentHelpers = require("../helpers/student-helpers");
const { response } = require("express");
var path = require("path");
var fs = require("fs");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedTutorIn) {
    next();
  } else {
    res.redirect("/tutor_login");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});
router.get("/tutor_login", (req, res) => {
  if (req.session.loggedTutorIn) {
    res.redirect("/tutor_home");
  } else {
    res.render("tutor/tutor_login", { errors: req.session.errors });
    req.session.errors = null;
  }
});

router.post("/tutor_login", (req, res) => {
  req.check("Email", "Invalid Username ").isEmail();
  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    res.redirect("/tutor_login");
  } else {
    tutorHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedTutorIn = true;
        req.session.tutor = response.tutor;
        //console.log(req.session);
        res.redirect("/tutor_home");
      } else {
        req
          .check("Password", "Invalid Username or Password")
          .isLength({ min: 50 });
        var errors = req.validationErrors();
        req.session.errors = errors;
        res.redirect("/tutor_login");
      }
    });
  }
});
router.get("/logout",verifyLogin, (req, res) => {
  req.session.tutor = null;
  req.session.loggedTutorIn = false;
  res.redirect("/");
});
router.get("/tutor_profile", verifyLogin, (req, res) => {
  tutorHelpers.getProfileDetails().then((profile) => {
    //console.log(profile);
    res.render("tutor/tutor_profile", { tutor: true, profile });
  });
});
router.get("/tutor_editprofile", verifyLogin, async (req, res) => {
  let profile = await tutorHelpers.getTutorDetails(req.query.id);
  //console.log(profile);
  res.render("tutor/tutor_editprofile", {
    tutor: true,
    profile,
    photoError: req.session.photoError,
  });
  req.session.photoError = null;
});
router.post("/tutor_editprofile", (req, res) => {
  // console.log(req.body);
  tutorHelpers.updateProfile(req.body).then(() => {
    let id = req.body.id;
    if (req.files) {
      let image = req.files.Image;
      let extName = path.extname(image.name);
      let imgList = [".png", ".jpg", ".jpeg", ".gif"];
      if (imgList.includes(extName)) {
        image.mv("./public/tutor-images/" + id + ".jpg");
        res.redirect("/tutor_profile");
      } else {
        req.session.photoError = "FAILED!!! Image format not recongnized";
        res.redirect("/tutor_editprofile");
      }
    } else {
      res.redirect("/tutor_profile");
    }
  });
});
router.get("/tutor_students", verifyLogin, (req, res) => {
  studentHelpers.getAllStudents().then((students) => {
    //console.log(students);
    res.render("tutor/tutor_students", { tutor: true, students });
  });
});

router.get("/tutor_addstudent", verifyLogin, (req, res) => {
  res.render("tutor/tutor_addstudent", {
    tutor: true,
    photoError: req.session.photoError,
  });
  req.session.photoError = null;
});
router.post("/tutor_addstudent", (req, res) => {
  if (req.files.Image) {
    let image = req.files.Image;
    let extName = path.extname(image.name);
    let imgList = [".png", ".jpg", ".jpeg"];
    if (imgList.includes(extName)) {
      studentHelpers.addStudent(req.body).then((id) => {
        res.redirect("/tutor_students");
        let image = req.files.Image;
        image.mv("./public/students-images/" + id + ".jpg");
      });
    } else {
      req.session.photoError = "FAILED!!! Image format not recongnized";
      res.redirect("/tutor_addstudent");
    }
  }
});

router.get("/delete_student/:id", verifyLogin, (req, res) => {
  let studentId = req.params.id;
  // console.log(studentId);
  studentHelpers.deleteStudent(studentId).then((response) => {
    res.redirect("/tutor_students");
  });
});

router.get("/tutor_editstudent", verifyLogin, async (req, res) => {
  let student = await studentHelpers.getStudentDetails(req.query.id);
  //console.log(student);
  res.render("tutor/tutor_editstudent", {
    tutor: true,
    student,
    photoError: req.session.photoError,
  });
  req.session.photoError = null;
});
router.post("/tutor_editstudent/:id", (req, res) => {
  studentHelpers.updateStudentDetails(req.params.id, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      let extName = path.extname(image.name);
      let imgList = [".png", ".jpg", ".jpeg"];
      if (imgList.includes(extName)) {
        let id = req.body.id;
        image.mv("./public/students-images/" + id + ".jpg");
        res.redirect("/tutor_students");
      } else {
        req.session.photoError = "FAILED!!! Image format not recongnized";
        res.redirect("/tutor_editstudent");
      }
    } else {
      res.redirect("/tutor_students");
    }
  });
});

router.get("/tutor_assignments", verifyLogin, async (req, res) => {
  let assignments = await tutorHelpers.getAllAssignments();
  res.render("tutor/tutor_assignments", {
    tutor: true,
    assignments,
    pdfError: req.session.pdfError,
  });
  req.session.pdfError = null;
});

router.post("/tutor_assignments", (req, res) => {
  if (req.files.Assignment) {
    let assignment = req.files.Assignment;
    let assignmentList = [".pdf", "DOC", "DOCX", "TXT"];
    let extName = path.extname(assignment.name);
    if (assignmentList.includes(extName)) {
      tutorHelpers.addAssignment(req.body).then((id) => {
        assignment.mv("./public/assignments/" + id + ".pdf");
        res.redirect("/tutor_assignments");
      });
    } else {
      req.session.pdfError = "Document file cannot be recongnized";
      res.redirect("/tutor_assignments");
    }
  }
});

router.get("/delete_assignment/:id", verifyLogin, (req, res) => {
  let assignmentId = req.params.id;
  //console.log(assignmentId);
  tutorHelpers.deleteAssignment(assignmentId).then((response) => {
    res.redirect("/tutor_assignments");
  });
});

router.get("/tutor_validateStudAssignments", verifyLogin, async (req, res) => {
  let assignments = await tutorHelpers.assignmentsSubmitted(req.query.id);
  let profile = req.query;
  let totalDays = await studentHelpers.getTotalDays();
  let presentDays = await studentHelpers.getPresentDays(profile.id);
  let absentDays = totalDays - presentDays;
  let percentage = (presentDays / totalDays) * 100;
  //console.log(profile);
  res.render("tutor/tutor_validateStudAssignments", {
    tutor: true,
    assignments,
    profile,
    totalDays,
    presentDays,
    absentDays,
    percentage,
  });
});

router.get("/tutor_notes", verifyLogin, async (req, res) => {
  let notes = await tutorHelpers.getAllNotes();
  // console.log(notes);
  res.render("tutor/tutor_notes", { tutor: true, notes });
});

router.post("/tutor_notes", (req, res) => {
  tutorHelpers.addNotes(req.body).then((id) => {
    let Document = req.files.Document;
    let Video = req.files.Video;
    Document.mv("./public/documents/" + id + ".pdf");
    Video.mv("./public/videos/" + id + ".mp4");
    res.redirect("/tutor_notes");
  });
});

router.get("/tutor_deleteNotes/:id", verifyLogin, (req, res) => {
  let notesId = req.params.id;
  //console.log(notesId);
  tutorHelpers.deleteNotes(notesId).then((response) => {
    res.redirect("/tutor_notes");
  });
});

router.get("/tutor_attendance", verifyLogin, (req, res) => {
  let todayDate =
    new Date().getDate() +
    "/" +
    (new Date().getMonth() + 1) +
    "/" +
    new Date().getFullYear();
  tutorHelpers.getTodayAttendance().then((response) => {
    //console.log(response);
    res.render("tutor/tutor_attendance", {
      tutor: true,
      todayDate,
      details: response,
    });
  });
});

router.post("/tutor_attendance", verifyLogin, (req, res) => {
  let date = req.body.date;
  tutorHelpers.getThisAttendance(date).then((response) => {
    res.render("tutor/tutor_specificAttend", {
      tutor: true,
      date,
      details: response,
    });
  });
});

router.get("/tutor_announcement", verifyLogin, (req, res) => {
  let date =
    new Date().getDate() +
    "/" +
    (new Date().getMonth() + 1) +
    "/" +
    new Date().getFullYear();
  res.render("tutor/tutor_announcement", { tutor: true, date });
});

router.post("/tutor_announcement", verifyLogin, (req, res) => {
  tutorHelpers.addAnnouncement(req.body).then((id) => {
    if (req.files) {
      if (req.files.image && !req.files.pdf && !req.files.video) {
        res.redirect("/tutor_home");
        let image = req.files.image;
        image.mv("./public/announcements/images" + id + ".jpg");
        //   console.log("image");
      } else if (req.files.pdf && !req.files.image && !req.files.video) {
        res.redirect("/tutor_home");
        let pdf = req.files.pdf;
        pdf.mv("./public/announcements/pdfs" + id + ".pdf");
        //  console.log("pdf");
      } else if (req.files.video && !req.files.image && !req.files.pdf) {
        res.redirect("/tutor_home");
        let video = req.files.video;
        video.mv("./public/announcements/videos" + id + ".mp4");
        //  console.log("video");
      } else if (req.files.image && req.files.pdf && !req.files.video) {
        res.redirect("/tutor_home");
        let pdf = req.files.pdf;
        pdf.mv("./public/announcements/pdfs" + id + ".pdf");
        let image = req.files.image;
        image.mv("./public/announcements/images" + id + ".jpg");
        // console.log("image and pdf ");
      } else if (req.files.image && !req.files.pdf && req.files.video) {
        res.redirect("/tutor_home");
        let image = req.files.image;
        image.mv("./public/announcements/images" + id + ".jpg");
        let video = req.files.video;
        video.mv("./public/announcements/videos" + id + ".mp4");
        // console.log("image and video");
      } else if (!req.files.image && req.files.pdf && req.files.video) {
        res.redirect("/tutor_home");
        let pdf = req.files.pdf;
        pdf.mv("./public/announcements/pdfs" + id + ".pdf");
        let video = req.files.video;
        video.mv("./public/announcements/videos" + id + ".mp4");
        // console.log("pdf and video ");
      } else {
        res.redirect("/tutor_home");
        let image = req.files.image;
        image.mv("./public/announcements/images" + id + ".jpg");
        let pdf = req.files.pdf;
        pdf.mv("./public/announcements/pdfs" + id + ".pdf");
        let video = req.files.video;
        video.mv("./public/announcements/videos" + id + ".mp4");
        // console.log("all present");
      }
    } else {
      res.redirect("/tutor_home");
      //console.log("nothing");
    }
  });
});

router.get("/tutor_announceDetails/:id", verifyLogin, async (req, res) => {
  let announcement = await tutorHelpers.getThisAnnounce(req.params.id);
  //console.log(announcement);
  let id = announcement._id;
  let image = "./public/announcements/images" + id + ".jpg";
  let pdf = "./public/announcements/pdfs" + id + ".pdf";
  let video = "./public/announcements/videos" + id + ".mp4";
  if (fs.existsSync(image) && fs.existsSync(pdf) && fs.existsSync(video)) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      image,
      pdf,
      video,
      announcement,
    });
    // console.log("all present");
  } else if (
    !fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      pdf,
      video,
      announcement,
    });
    //  console.log("pdf and video ");
  } else if (
    fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      image,
      video,
      announcement,
    });
    // console.log("image and video ");
  } else if (
    fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      image,
      pdf,
      announcement,
    });
    //  console.log("image and pdf ");
  } else if (
    !fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      video,
      announcement,
    });
    // console.log(" video ");
  } else if (
    !fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      pdf,
      announcement,
    });
    // console.log("pdf");
  } else if (
    fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", {
      tutor: true,
      image,
      announcement,
    });
    // console.log("image");
  } else if (
    !fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_announceDetails", { tutor: true, announcement });
    // console.log("all absent");
  }
});

router.get("/delete_announcement/:id", verifyLogin, (req, res) => {
  let id = req.params.id;
  let image = "./public/announcements/images" + id + ".jpg";
  let pdf = "./public/announcements/pdfs" + id + ".pdf";
  let video = "./public/announcements/videos" + id + ".mp4";
  tutorHelpers.deleteAnnouncement(id).then((response) => {
    if (fs.existsSync(image) && fs.existsSync(pdf) && fs.existsSync(video)) {
      res.redirect("/tutor_home");
    } else if (
      !fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log("pdf and video ");
    } else if (
      fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      //console.log("image and video ");
    } else if (
      fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      console.log("image and pdf ");
    } else if (
      !fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log(" video ");
    } else if (
      !fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      //  console.log("pdf");
    } else if (
      fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log("image");
    } else if (
      !fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log("all absent");
    }
  });
});

router.get("/tutor_photos", verifyLogin, (req, res) => {
  tutorHelpers.getPhotos().then((photos) => {
    res.render("tutor/tutor_photos", { tutor: true, photos });
  });
});

router.post("/tutor_photos", verifyLogin, (req, res) => {
  let image = req.files.Image;
  tutorHelpers.addPhotos(req.body).then((id) => {
    res.redirect("/tutor_photos");
    image.mv("./public/photos/" + id + ".jpg");
  });
});

router.get("/delete_photos/:id", verifyLogin, (req, res) => {
  let id = req.params.id;
  tutorHelpers.deletePhoto(id).then((response) => {
    res.redirect("/tutor_photos");
  });
});

router.get("/tutor_events", verifyLogin, (req, res) => {
  res.render("tutor/tutor_events", { tutor: true });
});

router.post("/tutor_events", verifyLogin, (req, res) => {
  // console.log("post method worked");
  tutorHelpers.addEvent(req.body).then((id) => {
    if (req.files) {
      // console.log("file received");
      if (req.files.image && !req.files.pdf && !req.files.video) {
        res.redirect("/tutor_home");
        let image = req.files.image;
        image.mv("./public/events/images" + id + ".jpg");
        //   console.log("image");
      } else if (req.files.pdf && !req.files.image && !req.files.video) {
        res.redirect("/tutor_home");
        let pdf = req.files.pdf;
        pdf.mv("./public/events/pdfs" + id + ".pdf");
        //  console.log("pdf");
      } else if (req.files.video && !req.files.image && !req.files.pdf) {
        res.redirect("/tutor_home");
        let video = req.files.video;
        video.mv("./public/events/videos" + id + ".mp4");
        //  console.log("video");
      } else if (req.files.image && req.files.pdf && !req.files.video) {
        res.redirect("/tutor_home");
        let pdf = req.files.pdf;
        pdf.mv("./public/events/pdfs" + id + ".pdf");
        let image = req.files.image;
        image.mv("./public/events/images" + id + ".jpg");
        // console.log("image and pdf ");
      } else if (req.files.image && !req.files.pdf && req.files.video) {
        res.redirect("/tutor_home");
        let image = req.files.image;
        image.mv("./public/events/images" + id + ".jpg");
        let video = req.files.video;
        video.mv("./public/events/videos" + id + ".mp4");
        // console.log("image and video");
      } else if (!req.files.image && req.files.pdf && req.files.video) {
        res.redirect("/tutor_home");
        let pdf = req.files.pdf;
        pdf.mv("./public/events/pdfs" + id + ".pdf");
        let video = req.files.video;
        video.mv("./public/events/videos" + id + ".mp4");
        // console.log("pdf and video ");
      } else {
        res.redirect("/tutor_home");
        let image = req.files.image;
        image.mv("./public/events/images" + id + ".jpg");
        let pdf = req.files.pdf;
        pdf.mv("./public/events/pdfs" + id + ".pdf");
        let video = req.files.video;
        video.mv("./public/events/videos" + id + ".mp4");
        // console.log("all present");
      }
    } else {
      res.redirect("/tutor_home");
      //console.log("nothing");
    }
  });
});

router.get("/tutor_eventDetails/:id", verifyLogin, async (req, res) => {
  let event = await tutorHelpers.getThisEvent(req.params.id);
  //console.log(event);
  let id = event._id;
  let amount = event.Amount;
  //console.log(amount);
  let image = "./public/events/images" + id + ".jpg";
  let pdf = "./public/events/pdfs" + id + ".pdf";
  let video = "./public/events/videos" + id + ".mp4";
  var todayDateObject = new Date()
  var eventDate =  event.Date 
var dateParts = eventDate.split("/");
var eventDateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
if(todayDateObject>eventDateObject){
    date=true
    console.log(date);
  }else{
    date=false
    console.log(date);
  }
  if (fs.existsSync(image) && fs.existsSync(pdf) && fs.existsSync(video)) {
    res.render("tutor/tutor_eventDetails", {
      tutor: true,
      image,
      pdf,
      video,
      event,
      amount,
      date
    });
    // console.log("all present");
  } else if (
    !fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", {
      tutor: true,
      pdf,
      video,
      event,
      amount,
      date
    });
    //  console.log("pdf and video ");
  } else if (
    fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", {
      tutor: true,
      image,
      video,
      event,
      amount,
      date
    });
    // console.log("image and video ");
  } else if (
    fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", {
      tutor: true,
      image,
      pdf,
      event,
      amount,
      date
    });
    //  console.log("image and pdf ");
  } else if (
    !fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", {
      tutor: true,
      video,
      event,
      amount,
      date
    });
    // console.log(" video ");
  } else if (
    !fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", { tutor: true, pdf, event, amount });
    // console.log("pdf");
  } else if (
    fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", {
      tutor: true,
      image,
      event,
      amount,
      date
    });
    // console.log("image");
  } else if (
    !fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("tutor/tutor_eventDetails", { tutor: true, event, amount });
    // console.log("all absent");
  }
});

router.get("/delete_event/:id", verifyLogin, (req, res) => {
  let id = req.params.id;
  let image = "./public/events/images" + id + ".jpg";
  let pdf = "./public/events/pdfs" + id + ".pdf";
  let video = "./public/events/videos" + id + ".mp4";
  tutorHelpers.deleteEvent(id).then((response) => {
    if (fs.existsSync(image) && fs.existsSync(pdf) && fs.existsSync(video)) {
      res.redirect("/tutor_home");
    } else if (
      !fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log("pdf and video ");
    } else if (
      fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      //console.log("image and video ");
    } else if (
      fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      console.log("image and pdf ");
    } else if (
      !fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log(" video ");
    } else if (
      !fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      //  console.log("pdf");
    } else if (
      fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log("image");
    } else if (
      !fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.redirect("/tutor_home");
      // console.log("all absent");
    }
  });
});

router.post("/tutor_knowPaid", verifyLogin, (req, res) => {
  //console.log(req.body);
  tutorHelpers.knowPaid(req.body.eventId).then((response) => {
    res.render("tutor/tutor_knowPaid", { tutor: true, response });
  });
});

router.get("/tutor_home", verifyLogin, async (req, res) => {
  let announcements = await tutorHelpers.getAllAnnouncements();
  let events = await tutorHelpers.getAllEvents();
  //console.log(announcements);
  // console.log(events);
  res.render("tutor/tutor_home", { tutor: true, announcements, events });
});

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
