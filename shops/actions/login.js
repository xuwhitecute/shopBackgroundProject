
$(".submit_btn").click(function(){
    $(".error span").html("");
    var username=$(".J_username").val();
    var pwd=$(".J_pwd").val();
    var code=$(".J_code").val();
    let Unmreg=/^[a-zA-Z0-9_-]{4,16}$/;
    let Pwdreg=/^[a-zA-Z\d_]{6,}$/;
    data={username,pwd};
    if(!Unmreg.test(username)){
      $(".error span").html("用户名不符合规范");
    }else if(!Pwdreg.test(pwd)){
      $(".error span").html("密码不符合规范");
    }else{
        $.ajax({
            type: 'POST',
            // url: config.serverUrl+"login",
            url: config.selfUrl+"login",
            data: data,
            // success: function(result){
            //   switch(result.code){
            //     case "0":
            //     return  $(".error span").html("用户名账号密码不匹配");
            //     break;
            //     case "1":
            //     return  window.location.href="/";
            //     break;
            //     case "2":
            //     return  $(".error span").html("用户名账号密码不匹配");
            //     break;
            //   }
            // }
          });
 
    }
  })

$(".toreg").click(()=>{
  window.location.href="/register";
})