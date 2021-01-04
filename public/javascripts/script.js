

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