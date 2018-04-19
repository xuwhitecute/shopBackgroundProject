var express = require("express");
var Router = express.Router();
// var pool=require("./pool");
var {selectData}=require("../tools/mysql_func");
var {formatDateToString}=require("../tools/timestamp ");
var axios=require("axios");
var async=require("async");
var {enc,smallenc}=require("../tools/enc");

Router.post("/register",(req,res)=>{
   var {username,pwd,code,phone}=req.body;
   async.waterfall([
       function(callback){//判断用户名是否注册
            var sql=`select count(*) from userinfo where username= ?`;
            var parmas=[username];
            selectData(sql,parmas)
                .then((result)=>{
                    if(result[0]["count(*)"]>0){
                        callback('-1',null)//该用户名字已经注册
                    }else{
                        callback(null,"1")//该用户名字没有注册
                    }
                })
       },
       function(arg,callback){//判断电话是否注册
        var sql=`select count(*) from userinfo where phone= ?`;
        var parmas=[phone];
        selectData(sql,parmas)
            .then((result)=>{
                if(result[0]["count(*)"]>0){
                    callback('-2',null)//该用户电话已经注册
                }else{
                    callback(null,"2")//该用户电话没有注册
                }
            })
        },
        function(arg,callback){//判断验证码是否相等
            var sql=`select code from sendcode where phone= ?`;
            var parmas=[phone];
            selectData(sql,parmas)
                .then((result)=>{
                    if(result[0].code==code){
                        callback(null,"3")//验证码正确
                    }else{
                        callback("-3",null)//验证码不正确
                    }
                })
            },
       function(arg,callback){
            var sql=`insert into userinfo (username,pwd,createtime,phone) values (?,?,now(),?)`;
            var parmas=[username,pwd,phone];
            selectData(sql,parmas)
            .then((result)=>{
                if(result.affectedRows>0){
                    callback(null,"4")//该用户注册成功
                }else{
                    callback("-4",null)//该用户注册不成功
                }
            })
       }
   ],(err,result)=>{
       if(err){
           res.json({code:err});
           res.end();

       }else{
           res.json({code:result});
           res.end();
       }
        
   })

})//注册
Router.post("/login",(req,res)=>{
    var {username,pwd}=req.body;
   async.waterfall([
        function(callback){
            var sql=`select count(*) from userinfo where username= ?`;
            var parmas=[username];
            selectData(sql,parmas)
                .then((result)=>{
                    if(result[0]["count(*)"]>0){
                        callback(null,"1")//该用户注册了
                    }else{
                        callback(null,"0")//该用户没有注册
                    }
                })
        },
       function(arg,callback){
            if(arg=="1"){
                var sql=`select * from userinfo where username= ?`;
                var parmas=[username];
                selectData(sql,parmas)
                    .then((result)=>{
                       if(result[0].pwd==pwd){
                           callback(null,"1")//密码匹配
                           req.session.username=username;
                           req.session.save();                    
                       }else{
                           callback(null,"2")//密码不匹配
                       }
                    })
            }else{
                callback(null,"0")//用户没有注册
            }

       },
   ],(err,result)=>{
        if(err) throw err; 
        res.json({code:result});
        res.end();
   })
})//登录
Router.post("/sendcore",(req,res)=>{
    var {phone}=req.body;
    let number=Math.floor(Math.random()*900000+100000);
    let times=formatDateToString();
    const ACCOUNTSID="2181dba0a8c4407cb6df34856dfbb38e";
    const AUTHTOKEN="9cdf231e60d64105b898579934de3822";
    let sig=smallenc(ACCOUNTSID+AUTHTOKEN+times);
    let data=`accountSid=2181dba0a8c4407cb6df34856dfbb38e&smsContent=【one科技】您的验证码为${number}，请于{2}分钟内正确输入，如非本人操作，请忽略此短信。&to=${phone}&timestamp=${times}&sig=${sig}&respDataType=JSON`;
    var instance = {
        method: 'post', 
        baseURL: 'https://api.miaodiyun.com/20150822/industrySMS/sendSMS',
        headers: {'Content-type':'application/x-www-form-urlencoded;charset:utf-8'},
        data:data,
      };
    axios.request(instance)
    .then(axiosres=>axiosres.data)
    .then(data=>{
        console.log(data.respCode,"respcode");
        if(data.respCode=="00000"){//短信发送成功
            async.waterfall([function(callback){
                var sql=`select count(*) from sendcode where phone= ? `;
                var parmas=[phone];
                selectData(sql,parmas)
                .then((result)=>{
                    if(result[0]["count(*)"]>0){
                        callback(null,"1")//该用户发送过验证码
                    }else{
                        callback(null,"0")//该用户没有发送过验证码
                    }
                })
            },
            function(agr,callback){
                if(agr==1){
                    var sql=`update sendcode set code=? where phone= ?`;
                    var parmas=[number,phone];
                    selectData(sql,parmas)
                        .then(result=>{
                            console.log(result.changedRows,"have");
                            if(result.changedRows>0){
                                callback(null,"2")//数据库更改成功
                            }else{
                                callback(null,"3")//数据库更改不成功
                            }
                        })
                }else{
                    var sql=`INSERT INTO sendcode (phone,code) VALUES (?,?)`;
                    var parmas=[phone,number];
                    selectData(sql,parmas)
                    .then(result=>{
                        if(result.affectedRows >0){
                            callback(null,"2")//数据库更改成功
                        }else{
                            callback(null,"3")//数据库更改不成功
                        }
                    })
                }
            }],(err,result)=>{
                if(err) throw err;
                setTimeout(()=>{//5分钟后删除
                    var sql=`delete  FROM  sendcode  where  phone= ? `;
                    var parmas=[phone];
                    selectData(sql,parmas)
                    .then(result=>{ 
                        if(result.affectedRows >0){
                            
                        }else{
                            
                        }
                    })
                },300000)
                res.json({code:result});
                res.end();
            })
        }else{
            res.json({code:'0'})//短信发送不成功
            res.end();
        }
    });
  
})//发送短信验证
Router.get("/loginout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect("/users/login");
      })
})//退出

module.exports=Router;