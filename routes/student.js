var express = require("express");
var router = express.Router();
var studentHelpers = require("../helpers/student-helpers");
var tutorHelpers = require("../helpers/tutor-helpers");
const { response } = require("express");
const { default: swal } = require("sweetalert");
const { HTTPVersionNotSupported } = require("http-errors");
var path = require("path");
const { log } = require("console");
var fs = require("fs");
const paypal = require("paypal-rest-sdk");
const { deflateSync } = require("zlib");
const { deleteStudent } = require("../helpers/student-helpers");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AZfsx2Mruy-HUSjovhN0hhwd_JoyQXbZCCGwr0_wryt8oXCuGqnpMtLLphbUAEZOqcJcLH3O80j3u731",
  client_secret:
    "EMDgLoK_HTVGqtkjZcEsS_6055PkhOWtIA2FaGdVCmPCHEqEGPDQ4GUAzr0jkQCLtNcz6ay2VQNFmOak",
});

const verifyStudentIn = (req, res, next) => {
  if (req.session.loggedStudentIn) {
    next();
  } else {
    res.redirect("/student/student_login");
  }
};
/* GET student listing. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/student_loginUseOtp", (req, res) => {
  if (req.session.loggedStudentIn) {
    res.redirect("/student/student_home");
  } else {
    res.render("student/student_loginUseOtp");
  }
});

router.post("/student_loginUseOtp", (req, res) => {
  studentHelpers.checkMobNum(req.body).then((response) => {
    if (response.status) {
      req.session.student = response.student;
      res.json(response);
    } else {
      res.json({ status: false });
    }
  });
});

router.get("/student_verifyOtpLogin/:otpId", (req, res) => {
  if (req.session.loggedStudentIn) {
    res.redirect("/student/student_home");
  } else {
    let otpId = req.params.otpId;
    res.render("student/student_verifyOtpLogin", { otpId });
  }
});

router.post("/student_verifyOtpLogin", (req, res) => {
  studentHelpers.verifyOtp(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.loggedStudentIn = true;
      res.json(response);
    } else {
      res.json({});
    }
  });
});

router.get("/student_resentOtpLogin/:otpId", (req, res) => {
  let otpId = req.params.otpId;
  studentHelpers.resentOtp(otpId).then((response) => {
    res.redirect("/student/student_verifyOtpLogin/" + otpId);
  });
});

router.get("/student_sentotp", (req, res) => {
  if (req.session.loggedStudentIn) {
    res.redirect("/student/student_home");
  } else {
    res.render("student/student_sentotp");
  }
});

router.post("/student_sentotp", (req, res) => {
  studentHelpers.checkMobNum(req.body).then((response) => {
    if (response.status) {
      req.session.Number = response.student.Mob;
      // console.log(req.session.Number);
      res.json(response);
    } else {
      res.json({ status: false });
    }
  });
});

router.get("/student_verifyOtp/:otpId", (req, res) => {
  if (req.session.loggedStudentIn) {
    res.redirect("/student/student_home");
  } else {
    let otpId = req.params.otpId;
    res.render("student/student_verifyOtp", { otpId });
  }
});
router.post("/student_verifyOtp", (req, res) => {
  studentHelpers.verifyOtp(req.body).then((response) => {
    //console.log(response);
    if (response.status) {
      res.json(response);
    } else {
      res.json({});
    }
  });
});

router.get("/student_resentOtp/:otpId", (req, res) => {
  let otpId = req.params.otpId;
  studentHelpers.resentOtp(otpId).then((response) => {
    res.redirect("/student/student_verifyOtp/" + otpId);
  });
});

router.get("/student_login", (req, res) => {
  //console.log(req.session.Number);
  if (req.session.loggedStudentIn) {
    res.redirect("/student/student_home");
  } else {
    res.render("student/student_login", { error: req.session.loginErr });
    req.session.loginErr = null;
  }
});

router.post("/student_login", (req, res) => {
  studentHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.student = response.student;
      req.session.loggedStudentIn = true;
      req.session.Number = null;
      res.redirect("/student/student_home");
    } else {
      req.session.loginErr = "Invalid username or password";
      res.redirect("/student/student_login");
    }
  });
});

router.get("/student_changepassword", (req, res) => {
  if (req.session.loggedStudentIn) {
    res.redirect("/student/student_home");
  } else {
    res.render("student/student_changepassword", {
      error: req.session.loginErr,
    });
    req.session.loginErr = null;
  }
});

router.post("/student_changepassword", (req, res) => {
  //console.log(req.body);
  req
    .check("newPass", "Passwords do not match")
    .isLength({ min: 8 })
    .equals(req.body.Password);
  var error = req.validationErrors();
  if (error) {
    req.session.loginErr = error;
    //console.log(req.session.Number);
    res.redirect("/student/student_changepassword");
  } else {
    studentHelpers
      .changePassword(req.session.Number, req.body)
      .then((response) => {
        res.redirect("/student/student_login");
      });
  }
});
router.get("/student_profile", verifyStudentIn, (req, res) => {
  id = req.session.student._id;
  studentHelpers.getStudentProfileDetails(id).then((profile) => {
    res.render("student/student_profile", { student: true, profile });
    console.log(profile);
  });
});

router.get("/student_assignment", verifyStudentIn, (req, res) => {
  studentHelpers.getAllAssignments().then((assignments) => {
    console.log(assignments);
    res.render("student/student_assignment", {
      student: true,
      studentId: req.session.student._id,
      assignments,
      pdfError: req.session.pdfError,
    });
    req.session.pdfError = null;
  });
});

router.post(
  "/student_submitAssignment/:assignmentsId",
  verifyStudentIn,
  (req, res) => {
    if (req.files) {
      let studentId = req.session.student._id;
      let assignmentsId = req.params.assignmentsId;
      let assignment = req.files.Assignment;
      let assignmentList = [".pdf", "DOC", "DOCX", "TXT"];
      let extName = path.extname(assignment.name);
      if (assignmentList.includes(extName)) {
        studentHelpers
          .addStudentAssignment(assignmentsId, studentId)
          .then(() => {
            assignment.mv(
              "./public/studentAssignments/" +
                assignmentsId +
                "." +
                studentId +
                ".pdf"
            );
            res.redirect("/student/student_assignment");
          });
      } else {
        req.session.pdfError = "Document file cannot be recongnized";
        res.redirect("/student/student_assignment");
      }
    } else {
      req.session.pdfError = "Document field is empty";
      res.redirect("/student/student_assignment");
    }
  }
);

router.get("/student_notes", verifyStudentIn, (req, res) => {
  studentHelpers.getAllNotes().then((notes) => {
    res.render("student/student_notes", {
      student: true,
      notes,
      student: req.session.student,
    });
  });
});

router.get(
  "/student_registerAttendance/:dd/:mm/:yyyy",
  verifyStudentIn,
  (req, res) => {
    let date = +req.params.dd + "/" + req.params.mm + "/" + req.params.yyyy;
    //console.log(date+"date after video end")
    studentHelpers
      .registerAttendance(date, req.session.student._id)
      .then((response) => {
        if (response) {
          res.json({ status: true });
          console.log("Present marked");
        } else {
          res.json({});
          console.log("absent marked");
        }
      });
  }
);

router.get("/student_task", verifyStudentIn, async (req, res) => {
  let assignment = await studentHelpers.getLastAssignment();
  let note = await studentHelpers.getLastNote();
  res.render("student/student_task", {
    student: true,
    studentId: req.session.student._id,
    assignment,
    note,
  });
});

router.get("/student_attendance", verifyStudentIn, async (req, res) => {
  let totalDays = await studentHelpers.getTotalDays();
  let presentDays = await studentHelpers.getPresentDays(
    req.session.student._id
  );
  let absentDays = totalDays - presentDays;
  let percentage = (presentDays / totalDays) * 100;
  res.render("student/student_attendance", {
    student: true,
    totalDays,
    presentDays,
    absentDays,
    percentage,
  });
});

router.get("/student_announcement", verifyStudentIn, async (req, res) => {
  let announcements = await tutorHelpers.getAllAnnouncements();
  res.render("student/student_announcement", { student: true, announcements });
});

router.get("/student_event", verifyStudentIn, async (req, res) => {
  let events = await tutorHelpers.getAllEvents();
  res.render("student/student_event", { student: true, events });
});

router.get(
  "/student_announceDetails/:id",
  verifyStudentIn,
  async (req, res) => {
    let announcement = await tutorHelpers.getThisAnnounce(req.params.id);
    //console.log(announcement);
    let id = announcement._id;
    let image = "./public/announcements/images" + id + ".jpg";
    let pdf = "./public/announcements/pdfs" + id + ".pdf";
    let video = "./public/announcements/videos" + id + ".mp4";
    if (fs.existsSync(image) && fs.existsSync(pdf) && fs.existsSync(video)) {
      res.render("student/student_announceDetails", {
        student: true,
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
      res.render("student/student_announceDetails", {
        student: true,
        pdf,
        video,
        announcement,
      });
      // console.log("pdf and video ");
    } else if (
      fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.render("student/student_announceDetails", {
        student: true,
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
      res.render("student/student_announceDetails", {
        student: true,
        image,
        pdf,
        announcement,
      });
      //console.log("image and pdf ");
    } else if (
      !fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      fs.existsSync(video)
    ) {
      res.render("student/student_announceDetails", {
        student: true,
        video,
        announcement,
      });
      // console.log(" video ");
    } else if (
      !fs.existsSync(image) &&
      fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.render("student/student_announceDetails", {
        student: true,
        pdf,
        announcement,
      });
      // console.log("pdf");
    } else if (
      fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.render("student/student_announceDetails", {
        student: true,
        image,
        announcement,
      });
      // console.log("image");
    } else if (
      !fs.existsSync(image) &&
      !fs.existsSync(pdf) &&
      !fs.existsSync(video)
    ) {
      res.render("student/student_announceDetails", {
        student: true,
        announcement,
      });
      // console.log("all absent");
    }
  }
);

router.get("/student_photos", verifyStudentIn, async (req, res) => {
  let photos = await tutorHelpers.getPhotos();
  //console.log(photos);
  res.render("student/student_photos", { student: true, photos });
});

router.get("/student_eventDetails/:id", async (req, res) => {
  let event = await tutorHelpers.getThisEvent(req.params.id);
  let studentId = "" + req.session.student._id;
  let eventId = "" + event.student;
  let id = event._id;
  console.log(event);
  let status = false;
  if (event.student) {
    if (eventId.includes(studentId)) {
      status = true;
      //console.log(status);
    } else {
      status = false;
      //console.log(status);
    }
  }
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
  let image = "./public/events/images" + id + ".jpg";
  let pdf = "./public/events/pdfs" + id + ".pdf";
  let video = "./public/events/videos" + id + ".mp4";
  let amount = event.Amount;
  if (fs.existsSync(image) && fs.existsSync(pdf) && fs.existsSync(video)) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      image,
      pdf,
      video,
      event,
      amount,
      status,
      date
    });
    // console.log("all present");
  } else if (
    !fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      pdf,
      video,
      event,
      amount,
      status,
      date
    });
    // console.log("pdf and video ");
  } else if (
    fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      image,
      video,
      event,
      amount,
      status,
      date
    });
    // console.log("image and video ");
  } else if (
    fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      image,
      pdf,
      event,
      amount,
      status,
      date
    });
    //console.log("image and pdf ");
  } else if (
    !fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      video,
      event,
      amount,
      status,
      date
    });
    // console.log(" video ");
  } else if (
    !fs.existsSync(image) &&
    fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      pdf,
      event,
      amount,
      status,
      date
    });
    // console.log("pdf");
  } else if (
    fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      image,
      event,
      amount,
      status,
      date
    });
    // console.log("image");
  } else if (
    !fs.existsSync(image) &&
    !fs.existsSync(pdf) &&
    !fs.existsSync(video)
  ) {
    res.render("student/student_eventDetails", {
      student: req.session.student,
      event,
      amount,
      status,
      date
    });
    // console.log("all absent");
  }
});

router.post("/student_razorPay", (req, res) => {
  console.log(req.body);
  let eventId = req.body.eventId;
  let amount = req.body.amount;
  studentHelpers.generateRazorpay(eventId, amount).then((response) => {
    res.json(response);
  });
});

router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  studentHelpers
    .verifyPayment(req.body, req.session.student._id)
    .then(() => {
      studentHelpers
        .paymentDone(req.body["order[receipt]"], req.session.student._id)
        .then(() => {
          console.log("payment successful");
          res.json({ status: true });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});

router.post("/student_paypal", verifyStudentIn, (req, res) => {
  console.log(req.body);
  let paypalamount = req.body.amount;
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/student/student_paypalsuccess",
      cancel_url: "http://localhost:3000/student/student_failed",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "",
              sku: "001",
              price: paypalamount,
              currency: "INR",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "INR",
          total: paypalamount,
        },
        description: req.body.eventId,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    console.log(payment);
    if (error) {
      console.log(error);
      res.redirect("/student_eventDetails");
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get("/student_paypalsuccess", verifyStudentIn, (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "INR",
          total: paypalamount,
        },
      },
    ],
  };
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error);
        res.redirect("/student/evenDetails");
      } else {
        console.log(payment);
        studentHelpers
          .paymentDone(
            payment.transactions[0].description,
            req.session.student._id
          )
          .then((response) => {
            studentHelpers
              .paypalPayment(
                req.session.student._id,
                payment.transactions[0].description
              )
              .then((response) => {
                res.redirect("/student/student_success");
              });
          });
      }
    }
  );
});

router.get("/student_success",verifyStudentIn, (req, res) => {
  res.render("student/student_success", { student: true });
});

router.get("/student_failed",verifyStudentIn, (req, res) => {
  res.render("student/student_failed", { student: true });
});

router.get("/student_home",verifyStudentIn, async (req, res) => {
  let studentStatus = await studentHelpers.checkTodayStatus(
    req.session.student._id
  );
  let announcements = await tutorHelpers.getAllAnnouncements();
  let events = await tutorHelpers.getAllEvents();
  //console.log(studentStatus);
  res.render("student/student_home", {
    student: true,
    status: studentStatus,
    announcements,
    events,
  });
});

router.get("/student_logout",verifyStudentIn, (req, res) => {
  req.session.student = null;
  req.session.loggedStudentIn = false;
  res.redirect("/");
});

module.exports = router;
