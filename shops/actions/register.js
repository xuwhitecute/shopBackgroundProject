


//注册按钮按下
$(".submit_btn").click(function(){
    $(".error span").html("");
    var username=$(".J_username").val();
    var phone=$(".J_phone").val();
    var pwd=$(".J_pwd").val();
    var dbpwd=$(".J_dbpwd").val();
    var code=$(".J_code").val();
    let Unmreg=/^[a-zA-Z0-9_-]{4,16}$/;
    let Pwdreg=/^[a-zA-Z\d_]{6,}$/;
    let phonereg=/^[1][3,4,5,7,8][0-9]{9}$/;
    let codereg=/^\d{6}$/;
    data={username,pwd,code,phone};
    if(!Unmreg.test(username)){
      $(".error span").html("用户名为4到16位字符");
    }else if(!phonereg.test(phone)){
      $(".error span").html("电话号码不正确");
    }else if(!Pwdreg.test(pwd)){
      $(".error span").html("密码最少位6位");
    }else if(pwd!=dbpwd){
      $(".error span").html("两次密码不相等");
    }else if(!codereg.test(code)){
      $(".error span").html("验证码错误");
    }else{
        $.ajax({
            type: 'POST',
            url: config.serverUrl+"register",
            data: data,
            success: function(result){
              switch(result.code){
                  case "-1":
                  return $(".error span").html("该用户名已经注册");
                  break;
                  case "-2":
                  return $(".error span").html("电话已经注册");
                  break;
                  case "-3":
                  return $(".error span").html("验证码不正确");
                  break;

                  case "4":
                  $(".error span").html("该用户名注册成功");
                  return window.location.href="/login"; 
                  break;

                  default:
                  return $(".error span").html("该用户名注册不成功");
                  break;
              }
            }
          });
 
    }
  })
//按下发送按钮

var sendcordBtn=document.getElementsByClassName("ver_btn")[0];
sendcordBtn.addEventListener("click",sendclick);
function sendclick(){
  var phone=$(".J_phone").val();
  let phonereg=/^[1][3,4,5,7,8][0-9]{9}$/;
  data={phone}
  if(!phonereg.test(phone)){
    $(".error span").html("电话号码不正确");
  }else{
    sendcorereg();
    $(".ver_btn").attr({style:"background:#DDD"})
    var times=30;
    $(".ver_btn").val(`重新发送${times}`);
    var timer=setInterval(()=>{
      times--;
      if(times==0){
        $(".ver_btn").attr({style:"background:##48bca5"})
        $(".ver_btn").val("获取验证码");
        sendcordBtn.addEventListener("click",sendclick);
        clearInterval(timer);
      }else{
        $(".ver_btn").attr({style:"background:#DDD"})
        $(".ver_btn").val(`重新发送${times}`);
        sendcordBtn.removeEventListener("click",sendclick);
      }
    },1000)
  }
}

function sendcorereg(){
    var phone=$(".J_phone").val();
    data={phone}
    $.ajax({
      type: 'POST',
      data:data,
      url: config.serverUrl+"sendcore",
      success: function(result){
          switch(result.code){
              case "2":
              return $(".error span").html("短信发送成功");
              break;
              default:
              return $(".error span").html("短信发送不成功");
              break;
          }
      }
    });
}