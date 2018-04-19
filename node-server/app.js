var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser=require("body-parser");
var session = require('express-session');
var RedisStore = require('connect-redis')(session);


var app=express();





var host="0.0.0.0";//内网IP

var port = "7000";


app.use(bodyParser.json());    // 接口  http://localhost:7000/login?username=qwer  ajax  req.body 
app.use(bodyParser.urlencoded({ extended: false })); // form 表单提交 
app.use(cookieParser());

// 处理跨域方法 jsonp
app.all('*',function(req,res,next){
    // res.header("Access-Control-Allow-Headers","Access-Control-Allow-Headers")
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    next();
});


var shop=require("./shop")

app.use("/shop",shop);

app.get("/",(req,res)=>{
    res.send("这是我的node 服务器...");
});

app.listen(port,host,()=>{
    console.log(`node server is running at http://${host}:${port}`)
});
