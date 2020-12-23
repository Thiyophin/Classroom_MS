

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