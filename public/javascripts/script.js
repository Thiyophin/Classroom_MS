

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
            dangerMode:true,
            buttons:true,
            cancel:false
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
         location.href='/student/student_login'
       }else{
         alert('Incorrect OTP number')
             window.location.reload(true)
       }
      }
    })
  })