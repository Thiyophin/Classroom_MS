$('#sentOtp-form').submit((e)=>{
    e.preventDefault()
    $.ajax({
      url:'/student/student_sentotp',
      method:'post',
      data:$('#sentOtp-form').serialize(),
      success:(response)=>{
        if(response.status){
          location.href='/student/student_verifyOtp/'+response.otp_id
        }else{
          swal({
            title:'Mobile number not found',
            icon:"warning",
          }).then((val)=>{
            if(val)location.href='/student/student_sentotp'
          })        
        }
      }
    })
  })

  $('#verify-Otp').submit((e)=>{
    e.preventDefault()
    $.ajax({
      url:'/student/student_verifyOtp',
      method:'post',
      data:$('#verify-Otp').serialize(),
      success:(response)=>{
       console.log(response)
        if(response.status){
         location.href='/student/student_changepassword'
       }else{ swal({
        title:'Incorrect OTP number',
        icon:"warning",
      }).then((val)=>{
        if(val)  window.location.reload(true)
      })     
       }
      }
    })
  })

  $('#sentOtp-form-login').submit((e)=>{
    e.preventDefault()
    $.ajax({
      url:'/student/student_loginUseOtp',
      method:'post',
      data:$('#sentOtp-form-login').serialize(),
      success:(response)=>{
        if(response.status){
          location.href='/student/student_verifyOtpLogin/'+response.otp_id
        }else{
          swal({
            title:'Mobile number not found',
            icon:"warning",
          }).then((val)=>{
            if(val)location.href='/student/student_loginUseOtp'
          })        
        }
      }
    })
  })

  $('#verify-Otp-login').submit((e)=>{
    e.preventDefault()
    $.ajax({
      url:'/student/student_verifyOtpLogin',
      method:'post',
      data:$('#verify-Otp-login').serialize(),
      success:(response)=>{
       console.log(response)
        if(response.status){
         location.href='/student/student_home'
       }else{ swal({
        title:'Incorrect OTP number',
        icon:"warning",
      }).then((val)=>{
        if(val)  window.location.reload(true)
      })     
       }
      }
    })
  })

  function registerAttendance(date) {
    $.ajax({
        url:'/student/student_registerAttendance/'+date,
        method:'get',
        success:(response)=>{
         swal({
                     title:'Attendance Marked',
                     icon:'success',
                     buttons:{ok:false}
                 })   
        }
    })
    
  }

$('#datepicker').on('changeDate', function(ev){
    $(this).datepicker('hide');
});

$('#note_form').submit(function (event){
  event.preventDefault();
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = new FormData(this); //Encode form elements for submission
$.ajax({
  url : post_url,
  type: request_method,
  data : form_data,
contentType: false,
processData:false,
xhr: function(){
//upload Progress
var xhr = $.ajaxSettings.xhr();
if (xhr.upload) {
xhr.upload.addEventListener('progress', function(event) {
  var percent = 0;
  var position = event.loaded || event.position;
  var total = event.total;
  if (event.lengthComputable) {
    percent = Math.ceil(position / total * 100);
  }
  //update progressbar
  $("#upload-progress .progress-bar").css("width", + percent +"%");
}, true);
}
return xhr;
}
}).done(function(response){ 
  var delay=1000
         swal({
             title:'Notes added',
             icon:'success',
             buttons:{ok:false}
         }) , setTimeout(function(){
          window.location.reload(true)
         },delay) 
});
})

$('#image_form').submit(function (event){
  event.preventDefault();
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = new FormData(this); //Encode form elements for submission
$.ajax({
  url : post_url,
  type: request_method,
  data : form_data,
contentType: false,
processData:false,
xhr: function(){
//upload Progress
var xhr = $.ajaxSettings.xhr();
if (xhr.upload) {
xhr.upload.addEventListener('progress', function(event) {
  var percent = 0;
  var position = event.loaded || event.position;
  var total = event.total;
  if (event.lengthComputable) {
    percent = Math.ceil(position / total * 100);
  }
  //update progressbar
  $("#upload-progress .progress-bar").css("width", + percent +"%");
}, true);
}
return xhr;
}
}).done(function(response){ 
  var delay=1000
         swal({
             title:'Photo added',
             icon:'success',
             buttons:{ok:false}
         }) , setTimeout(function(){
          window.location.reload(true)
         },delay) 
});
})

   $('#eventRazorpay').submit(function (event){
  event.preventDefault();
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = new FormData(this); //Encode form elements for submission
$.ajax({
  url : post_url,
  type: request_method,
  data : form_data,
  success:(response)=>{
   razorpayPayment(response)
  }
})
})

$('#assignment_form').submit(function (event){
  event.preventDefault();
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = new FormData(this); //Encode form elements for submission
$.ajax({
  url : post_url,
  type: request_method,
  data : form_data,
contentType: false,
processData:false,
xhr: function(){
//upload Progress
var xhr = $.ajaxSettings.xhr();
if (xhr.upload) {
xhr.upload.addEventListener('progress', function(event) {
  var percent = 0;
  var position = event.loaded || event.position;
  var total = event.total;
  if (event.lengthComputable) {
    percent = Math.ceil(position / total * 100);
  }
  //update progressbar
  $("#upload-progress .progress-bar").css("width", + percent +"%");
}, true);
}
return xhr;
}
}).done(function(response){ 
  var delay=1000
         swal({
             title:'Assignments added',
             icon:'success',
             buttons:{ok:false}
         }) , setTimeout(function(){
          window.location.reload(true)
         },delay) 
});
})

var socket = io("https://classroom-management-system.herokuapp.com");
socket.on("notification", function(notification){
    console.log('topic : ',notification);
   $.notify("New Assingnment added\nTopic : "+notification.topic,{
       style: "bootstrap",
       autoHide: false,
       className: "success"
   });
});

var socket = io("https://classroom-management-system.herokuapp.com");
$("#sendNotification").click(function(){
  socket.emit("notification",{
    "topic":document.getElementById("topic").value
  })
        console.log("button clicked");
})
